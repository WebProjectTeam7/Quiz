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
} from '@chakra-ui/react';
import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../state/app.context';
import { addUserToLobby, updateUserStatus, subscribeToLobbyUpdates, removeUserFromLobby, updateUserBattleId } from '../../services/lobby.service';
import { createBattle } from '../../services/quiz-battle.service';
import { getUserByUsername } from '../../services/user.service';
import { QUIZ_BATTLE_TURNS_BY_PLAYER, QUIZ_BATTLE_STARTING_FIELD } from '../../common/components.constants';
import Swal from 'sweetalert2';
import UserProfileModal from '../../components/UserProfileModal/UserProfileModal';
import useModal from '../../custom-hooks/useModal';
import ChatComponent from '../../components/ChatComponent/ChatComponent';
import StatusAvatar from '../../components/StatusAvatar/StatusAvatar';
import './QuizBattleLobby.css';
import LobbyStatusEnum from '../../common/lobby-status.enum';

const QuizBattleLobby = () => {
    const { userData } = useContext(AppContext);
    const { isModalVisible, openModal, closeModal } = useModal();

    const navigate = useNavigate();
    const location = useLocation();

    const [userDetails, setUserDetails] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [battleInProgress, setBattleInProgress] = useState(false);
    const [loading, setLoading] = useState(false);

    const [lobbyUsers, setLobbyUsers] = useState([]);
    const lobbyUsersRef = useRef(lobbyUsers);

    useEffect(() => {
        if (userData) {
            addUserToLobby(userData.username);
        }
        const unsubscribe = subscribeToLobbyUpdates((users) => {
            setLobbyUsers(users);
            lobbyUsersRef.current = users;
            if (!battleInProgress) {
                handleQueueAndReadyUsers(users);
            }
        });

        const handleBeforeUnload = (event) => {
            if (userData) {
                removeUserFromLobby(userData.username);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            if (unsubscribe) unsubscribe();
            if (userData) {
                removeUserFromLobby(userData.username);
            }
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [userData, location.pathname, battleInProgress]);

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
        const readyUsers = sortedQueue.filter((user) => user.status === LobbyStatusEnum.READY);

        if (readyUsers.length >= 2) {
            const [user1, user2] = readyUsers.slice(0, 2);
            initiateQuizBattle(user1, user2);
        }
    };

    const toggleUserStatus = () => {
        if (userData) {
            const newStatus =
                lobbyUsers.find((user) => user.username === userData.username)?.status === LobbyStatusEnum.READY
                    ? LobbyStatusEnum.IDLE
                    : LobbyStatusEnum.READY;
            updateUserStatus(userData.username, newStatus);
        }
    };

    const initiateQuizBattle = async (user1, user2) => {
        if (battleInProgress) return;

        setBattleInProgress(true);
        setLoading(true);
        try {
            if (user1.username === userData.username) {
                const battleId = await createBattle(user1.username, user2.username, QUIZ_BATTLE_STARTING_FIELD, QUIZ_BATTLE_TURNS_BY_PLAYER * 2);
                await updateUserBattleId(user2.username, battleId);
                navigateToBattle(battleId);
            } else if (user2.username === userData.username) {
                setTimeout(() => {
                    const checkBattleId = async () => {
                        const currentLobbyUsers = lobbyUsersRef.current;
                        const user = currentLobbyUsers.find(user => user.username === user2.username);

                        if (user && user.battleId) {
                            navigateToBattle(user.battleId);
                            return;
                        }
                        setTimeout(checkBattleId, 2000);
                    };

                    checkBattleId();
                }, 6000);
            }
        } catch (error) {
            console.error('Error initiating quiz battle:', error);
        } finally {
            setLoading(false);
            setBattleInProgress(false);
        }
    };

    const navigateToBattle = (battleId) => {
        let timerInterval;

        Swal.fire({
            title: 'Get ready!',
            html: 'Starting in <b>3</b> seconds.',
            timer: 3000,
            timerProgressBar: true,
            didOpen: () => {
                const content = Swal.getHtmlContainer();
                if (content) {
                    timerInterval = setInterval(() => {
                        const timerElement = content.querySelector('b');
                        if (timerElement) {
                            timerElement.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                        }
                    }, 1000);
                }
            },
            willClose: () => {
                clearInterval(timerInterval);
                navigate(`/quiz-battle/${battleId}`);
            },
        });
    };

    const viewProfile = (username) => {
        const user = userDetails.find((user) => user.username === username);
        if (user) {
            setSelectedUser(user);
            openModal();
        }
    };

    return (
        <VStack spacing={6}>
            <Heading color="white">Lobby Chat</Heading>
            <ChatComponent />
            <Box padding="6" boxShadow="2xl" bg="gray.200" borderRadius="lg" width="80%" mt={4}>
                <Heading as="h2" size="lg" mb={6} textAlign="center" color="teal.600">
                    Quiz Battle Lobby
                </Heading>

                {loading && (
                    <Flex justify="center" align="center" height="100px">
                        <Spinner size="lg" />
                    </Flex>
                )}

                {userDetails.length === 0 ? (
                    !loading && (
                        < Flex justify="center" align="center" height="100px">
                            <Spinner size="lg" />
                        </Flex>
                    )
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
                                            <Text color="black" fontSize="xl" >{user.username}</Text>
                                        </HStack>
                                        <Badge colorScheme={user.status === LobbyStatusEnum.READY ? 'green' : 'orange'}>
                                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                        </Badge>
                                    </Flex>
                                </ListItem>
                            ))}
                        </List>

                        {lobbyUsers.find((user) => user.username === userData?.username)?.status === LobbyStatusEnum.READY ? (
                            <Button colorScheme="yellow" width="180px" onClick={toggleUserStatus}>
                                Switch to Idle
                            </Button>
                        ) : (
                            <Button colorScheme="teal" width="100px" onClick={toggleUserStatus}>
                                I'm Ready
                            </Button>
                        )}

                    </VStack>
                )}
                {selectedUser && (
                    <UserProfileModal
                        isOpen={isModalVisible}
                        onClose={closeModal}
                        username={selectedUser.username}
                    />
                )}
            </Box>
        </VStack >
    );
};

export default QuizBattleLobby;
