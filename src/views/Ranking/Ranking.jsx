/* eslint-disable indent */
import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Avatar, Text, Heading, Spinner, Icon, Button } from '@chakra-ui/react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../config/firebase-config';
import './Ranking.css';
import { FaCrown } from 'react-icons/fa';
import StatusAvatar from '../../components/StatusAvatar/StatusAvatar';
import UserProfileModal from '../../components/UserProfileModal/UserProfileModal';
import Pagination from '../../components/Pagination/Pagination';
import { PER_PAGE } from '../../common/components.constants';
import useModal from '../../custom-hooks/useModal';
import RankingModal from '../../components/RankingModal/RankingModal';
import { getQuizSummariesByCategory } from '../../services/quiz.service';
import { getUserByUsername } from '../../services/user.service';
import QuizCategoryEnum from '../../common/category-enum';

const Ranking = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rankingData, setRankingData] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const { isModalVisible: isRankingModalOpen, openModal: openRankingModal, closeModal: closeRankingModal } = useModal();
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const usersRef = ref(db, 'users');

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data)
        .map((key) => ({
          id: key,
          ...data[key],
        }))
        .filter((user) => user.role !== 'admin' && user.role !== 'organizer')
        .sort((a, b) => b.points - a.points);

      setUsers(usersArray);
    }
    setLoading(false);
  });
  }, []);

  const handleCategoryClick = async (category) => {
    setIsFetchingData(true);
    setSelectedCategory(category);

    try {
      const rankingData = await getQuizSummariesByCategory(category);
      rankingData.sort((a, b) => b.points - a.points);

      const rankingDataWithUserDetails = await Promise.all(
        rankingData.map(async (item) => {
          const userInfo = await getUserByUsername(item.username);
          return {
            ...item,
            uid: userInfo?.uid || 'unknown',
            avatar: userInfo?.avatar || userInfo?.avatarUrl || '',
            onlineStatus: userInfo?.onlineStatus || 'offline',
            role: userInfo?.role || 'unknown',
          };
        })
      );

      const filteredRankingData = rankingDataWithUserDetails.filter(
        (user) => user.role !== 'admin' && user.role !== 'organizer'
      );

      setRankingData(filteredRankingData);
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setIsFetchingData(false);
      openRankingModal();
    }
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  const getCrownColor = (index) => {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return '#cd7f32';
    return null;
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };

  const totalPages = Math.ceil(users.length / PER_PAGE);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * PER_PAGE;
  const currentUsers = users.slice(startIndex, startIndex + PER_PAGE);

  return (
    <VStack spacing={4} align="center" className="ranking-container">
      <Heading as="h2" size="lg" className="ranking-title">
      Who is the Quiz Champion?
      </Heading>
      <HStack className="ranking-category" spacing={2} mt={4}>
        {Object.values(QuizCategoryEnum).map((category) => (
          <Button
            key={category}
            colorScheme="blue"
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </Button>
        ))}
      </HStack>

      {currentUsers.map((user, index) => (
        <Box
          key={user.id}
          className={`ranking-box ${index < 3 ? 'top-three' : ''}`}
          borderColor={index < 3 ? 'purple.500' : 'gray.200'}
          borderWidth={index < 3 ? '2px' : '1px'}
          onClick={() => handleUserClick(user)}
          cursor="pointer"
        >
          <HStack spacing={4} className="ranking-item">
            <Text fontWeight="bold" fontSize="lg" className="ranking-index">
              {startIndex + index + 1}.
            </Text>
            {startIndex + index < 3 && (
              <Icon as={FaCrown} color={getCrownColor(index)} w={6} h={6} />
            )}
            <StatusAvatar uid={user.uid} src={user.avatar || user.avatarUrl || ''} size="lg" />
            <VStack align="start" spacing={1} flex="1">
              <Text fontWeight="bold" className="ranking-name">
                {user.username}
              </Text>
            </VStack>
            <Text className="ranking-points" fontWeight="bold">
              {user.points} pts
            </Text>
          </HStack>
        </Box>
      ))}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      {selectedUser && (
        <UserProfileModal
          isOpen={isModalOpen}
          onClose={closeModal}
          username={selectedUser.username}
        />
      )}
      <RankingModal
        isOpen={isRankingModalOpen}
        onClose={closeRankingModal}
        title={selectedCategory ? `${selectedCategory} Rankings` : 'Rankings'}
        data={rankingData}
        isLoading={isFetchingData}
      />
    </VStack>
  );
};

export default Ranking;