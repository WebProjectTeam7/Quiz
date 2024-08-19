/* eslint-disable indent */
import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Avatar, Text, Heading, Spinner, Icon} from '@chakra-ui/react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../config/firebase-config';
import './Ranking.css';
import { FaCrown } from 'react-icons/fa';

const Ranking = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(db, 'users');

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        usersArray.sort((a, b) => b.points - a.points);
        setUsers(usersArray);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Spinner size="xl" />;
  }

  const getCrownColor = (index) => {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return '#cd7f32';
    return null;
  };

  return (
<VStack spacing={4} align="center" className="ranking-container">
      <Heading as="h2" size="lg" className="ranking-title">
        Who is the best BI*CHES?
      </Heading>
      {users.map((user, index) => (
        <Box
          key={user.id}
          className={`ranking-box ${index < 3 ? 'top-three' : ''}`}
          borderColor={index < 3 ? 'purple.500' : 'gray.200'}
          borderWidth={index < 3 ? '2px' : '1px'}
        >
          <HStack spacing={4} className="ranking-item">
            <Text fontWeight="bold" fontSize="lg" className="ranking-index">
              {index + 1}.
            </Text>
            {index < 3 && (
              <Icon as={FaCrown} color={getCrownColor(index)} w={6} h={6} />
            )}
            <Avatar name={user.username} src={user.avatarUrl || ''} className="ranking-avatar" />
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
    </VStack>
  );
};

export default Ranking;
