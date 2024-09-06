import { useState, useEffect, useContext } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Spinner,
    Icon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
} from '@chakra-ui/react';
import { FaCrown } from 'react-icons/fa';
import Pagination from '../../components/Pagination/Pagination';
import StatusAvatar from '../../components/StatusAvatar/StatusAvatar';
import { PER_PAGE } from '../../common/components.constants';
import PropTypes from 'prop-types';
import UserProfileModal from '../UserProfileModal/UserProfileModal';
import { AppContext } from '../../state/app.context';

const RankingModal = ({ isOpen, onClose, title, data, isLoading }) => {
    const { userData } = useContext(AppContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    const getCrownColor = (index) => {
        if (index === 0) return 'gold';
        if (index === 1) return 'silver';
        if (index === 2) return '#cd7f32';
        return null;
    };

    if (isLoading) {
        return <Spinner size="xl" />;
    }

    const totalPages = Math.ceil(data.length / PER_PAGE);
    const startIndex = (currentPage - 1) * PER_PAGE;
    const currentData = data.slice(startIndex, startIndex + PER_PAGE);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    const closeUserProfileModal = () => {
        setSelectedUser(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{title || 'Ranking'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="center" className="ranking-container">
                        {currentData.map((item, index) => (
                            <Box
                                key={`${item.uid}-${index}`}
                                className={`ranking-box ${index < 3 ? 'top-three' : ''}`}
                                borderColor={index < 3 ? 'purple.500' : 'gray.200'}
                                borderWidth={index < 3 ? '2px' : '1px'}
                                onClick={() => handleUserClick(item)}
                                cursor="pointer"
                            >
                                <HStack spacing={4} className="ranking-item">
                                    <Text fontWeight="bold" fontSize="lg" className="ranking-index">
                                        {startIndex + index + 1}.
                                    </Text>
                                    {startIndex + index < 3 && (
                                        <Icon as={FaCrown} color={getCrownColor(index)} w={6} h={6} />
                                    )}
                                    <StatusAvatar
                                        uid={item.uid}
                                        src={item.avatar || item.avatarUrl || ''}
                                        size="lg"
                                        userData={userData}
                                    />
                                    <VStack align="start" spacing={1} flex="1">
                                        <Text fontWeight="bold" className="ranking-name">
                                            {item.username}
                                        </Text>
                                    </VStack>
                                    <Text className="ranking-points" fontWeight="bold">
                                        {item.points} pts
                                    </Text>
                                </HStack>
                            </Box>
                        ))}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </VStack>
                </ModalBody>
            </ModalContent>

            {selectedUser && (
                <UserProfileModal
                    isOpen={!!selectedUser}
                    onClose={closeUserProfileModal}
                    username={selectedUser.username || selectedUser.name}
                />
            )}
        </Modal>
    );
};

RankingModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            username: PropTypes.string.isRequired,
            points: PropTypes.number.isRequired,
            avatar: PropTypes.string,
            avatarUrl: PropTypes.string,
            uid: PropTypes.string.isRequired,
        })
    ).isRequired,
    isLoading: PropTypes.bool.isRequired,
};

export default RankingModal;
