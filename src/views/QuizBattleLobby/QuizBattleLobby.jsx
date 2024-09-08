import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../state/app.context';
import { addUserToLobby, updateUserStatus, subscribeToLobbyUpdates, removeUserFromLobby } from '../../services/lobby.service';
import { getUserByUsername } from '../../services/user.service';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatComponent from '../../components/ChatComponent/ChatComponent';
import Swal from 'sweetalert2';
import {
    Box,
    Heading,
    Text,
    Button,
    List,
    ListItem,
    Flex,
    Spinner,
    Badge,
    VStack,
    HStack,
    useToast
} from '@chakra-ui/react';
import StatusAvatar from '../../components/StatusAvatar/StatusAvatar';

const QuizBattleLobby = () => {
    const { userData } = useContext(AppContext);
    const [lobbyUsers, setLobbyUsers] = useState([]);
    const [readyUsers, setReadyUsers] = useState([]);
    const [userDetails, setUserDetails] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (userData) {
            addUserToLobby(userData.username);
        }
        const unsubscribe = subscribeToLobbyUpdates((users) => {
            setLobbyUsers(users);
            handleQueueAndReadyUsers(users);
        });

        return () => {
            if (unsubscribe) unsubscribe();
            if (userData) {
                removeUserFromLobby(userData.username);
            }
        };
    }, [userData, location.pathname]);

    useEffect(() => {
        loadUsers();
    }, [lobbyUsers]);

    const loadUsers = async () => {
        try {
            const usersWithDetails = await Promise.all(
                lobbyUsers.map(async (user) => {
                    const userInfo = await getUserByUsername(user.username);
                    return {
                        ...user,
                        uid: userInfo?.uid || 'unknown',
                        avatar: userInfo?.avatar || userInfo?.avatarUrl || '',
                        onlineStatus: userInfo?.onlineStatus || 'offline',
                    };
                })
            );
            setUserDetails(usersWithDetails);
        } catch (error) {
            console.error(error);
        }
    };

    const handleQueueAndReadyUsers = (users) => {
        const sortedQueue = users.sort((a, b) => a.timestamp - b.timestamp);
        const readyUsers = sortedQueue.filter((user) => user.status === 'ready');
        setReadyUsers(readyUsers);

        if (readyUsers.length >= 2) {
            const [user1, user2] = readyUsers.slice(0, 2);
            initiateQuizBattle(user1, user2);
        }
    };

    const toggleUserStatus = () => {
        if (userData) {
            const newStatus =
                lobbyUsers.find((user) => user.username === userData.username)?.status === 'ready'
                    ? 'waiting'
                    : 'ready';
            updateUserStatus(userData.username, newStatus);
        }
    };

    const initiateQuizBattle = (user1, user2) => {
        Swal.fire({
            title: 'Get ready!',
            text: 'The quiz battle will start in 3 seconds...',
            icon: 'warning',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            willClose: () => {
                navigate('/quiz-battle', { state: { user1, user2 } });
            },
        });
    };

    const viewProfile = (username) => {
        navigate(`/user-profile/${username}`);
    };

    return (
        <VStack spacing={6}>
            <Heading color="white">Lobby Chat</Heading>
            <ChatComponent />
            <Box padding="6" boxShadow="2xl" bg="gray.200" borderRadius="lg" width="80%" mt={4}>
                <Heading as="h2" size="lg" mb={6} textAlign="center" color="teal.600">
                    Quiz Battle Lobby
                </Heading>

                {userDetails.length === 0 ? (
                    <Flex justify="center" align="center" height="100px">
                        <Spinner size="lg" />
                    </Flex>
                ) : (
                    <VStack align="stretch" spacing={4}>
                        <Text fontSize="lg" fontWeight="bold" textAlign="center" color="gray.700">
                            Users currently in the lobby:
                        </Text>
                        <List spacing={3}>
                            {userDetails.map((user) => (
                                <ListItem
                                    key={user.username}
                                    border="1px"
                                    borderColor="gray.200"
                                    p={3}
                                    borderRadius="md"
                                    cursor="pointer"
                                    onClick={() => viewProfile(user.username)}
                                >
                                    <Flex justify="space-between" align="center">
                                        <HStack>
                                            <StatusAvatar uid={user.uid} src={user.avatar} size="lg" />
                                            <Text>{user.username}</Text>
                                        </HStack>
                                        <Badge colorScheme={user.status === 'ready' ? 'green' : 'orange'}>
                                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                        </Badge>
                                    </Flex>
                                </ListItem>
                            ))}
                        </List>

                        <Button
                            colorScheme="teal"
                            onClick={toggleUserStatus}
                            _hover={{ boxShadow: 'lg' }}
                        >
                            {lobbyUsers.find((user) => user.username === userData?.username)?.status === 'ready'
                                ? 'Switch to Waiting'
                                : 'I\'m Ready'}
                        </Button>
                    </VStack>
                )}
            </Box>
        </VStack>
    );
};

export default QuizBattleLobby;
