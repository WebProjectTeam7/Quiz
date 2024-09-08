import { useState, useEffect, useContext } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Text,
    Box,
    Flex,
    Button,
} from '@chakra-ui/react';
import { getUserByUsername } from '../../services/user.service';
import PropTypes from 'prop-types';
import StatusAvatar from '../StatusAvatar/StatusAvatar';
import { AppContext } from '../../state/app.context';
import Swal from 'sweetalert2';
import { banUser, unbanUser } from '../../services/admin.service';
import NotificationModal from '../NotificationModal/NotificationModal';
import useModal from '../../custom-hooks/useModal';
import { getOrganizationById } from '../../services/organization.service';
import { getQuizzesByAuthor } from '../../services/quiz.service';
import QuizAccessEnum from '../../common/access-enum';
import { inviteUserToPrivateQuiz } from '../../services/quiz.service';
import { sendNotificationToUser } from '../../services/notification.service';
import { NOTIFICATION_QUIZ_INVITE } from '../../common/notification-messages';
import NotificationEnum from '../../common/notification-enum';

export default function UserProfileModal({ isOpen, onClose, username, onBanUnban }) {
    const [userData, setUserData] = useState(null);
    const { userData: currentUserData } = useContext(AppContext);
    const [organizationData, setOrganizationData] = useState(null);
    const {
        isModalVisible: isNotificationModalOpen,
        openModal: openNotificationModal,
        closeModal: closeNotificationModal,
    } = useModal();
    const [privateQuizzes, setPrivateQuizzes] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getUserByUsername(username);
                if (data) {
                    setUserData(data);

                    if (data.organizationId) {
                        const orgData = await getOrganizationById(data.organizationId);
                        setOrganizationData(orgData);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        const fetchPrivateQuizzes = async () => {
            if (currentUserData?.username) {
                try {
                    const userQuizzes = await getQuizzesByAuthor(currentUserData.username);
                    const privateQuizzesList = userQuizzes.filter(quiz => quiz.type === QuizAccessEnum.PRIVATE);
                    setPrivateQuizzes(privateQuizzesList);
                } catch (error) {
                    console.error('Error fetching private quizzes:', error);
                }
            }
        };

        if (username) {
            fetchUserData();
            fetchPrivateQuizzes();
        }
    }, [username, currentUserData?.username]);

    const handleBanUnbanUser = async () => {
        const isBanned = userData.banned;

        Swal.fire({
            title: `Are you sure you want to ${isBanned ? 'unban' : 'ban'} this user?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, ${isBanned ? 'unban' : 'ban'} them!`,
            cancelButtonText: 'No, cancel!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (isBanned) {
                        await unbanUser(userData.uid);
                    } else {
                        await banUser(userData.uid, userData.username, userData.email);
                    }
                    const updatedUserData = { ...userData, banned: !isBanned };
                    setUserData(updatedUserData);
                    if (onBanUnban) {
                        onBanUnban(updatedUserData);
                    }
                    Swal.fire({
                        icon: 'success',
                        title: `User ${isBanned ? 'unbanned' : 'banned'} successfully!`,
                        confirmButtonText: 'OK',
                    });
                } catch (error) {
                    console.error(`Error ${isBanned ? 'unbanning' : 'banning'} user:`, error);
                    Swal.fire({
                        icon: 'error',
                        title: `Failed to ${isBanned ? 'unban' : 'ban'} user.`,
                        text: error.message,
                        confirmButtonText: 'OK',
                    });
                }
            }
        });
    };

    const handleInviteUserToQuiz = async (quizId, recipientUsername, quizTitle) => {
        try {
            await inviteUserToPrivateQuiz(quizId, recipientUsername);

            const notificationContent = NOTIFICATION_QUIZ_INVITE(currentUserData.username, quizTitle);

            const notificationData = {
                message: notificationContent,
                type: NotificationEnum.INVITE_TO_QUIZ,
                quizId: quizId,
                quizTitle: quizTitle,
                senderName: currentUserData.username,
            };

            await sendNotificationToUser(recipientUsername, notificationData);

            Swal.fire({
                icon: 'success',
                title: 'Invitation Sent',
                text: `User has been invited to the quiz "${quizTitle}"`,
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error('Error sending quiz invitation:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to Send Invitation',
                text: 'There was an error sending the invitation. Please try again.',
                confirmButtonText: 'OK',
            });
        }
    };

    if (!userData) return null;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{userData.username}'s Profile</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex justifyContent={organizationData ? 'space-between' : 'center'} alignItems="center" mb={4}>

                            <Box display="flex" flexDirection="column" alignItems="center">
                                <StatusAvatar uid={userData.uid} src={userData.avatar} size="xl" />
                                <Text fontSize="lg" fontWeight="bold" mt={2}>Role: {userData.role}</Text>
                            </Box>

                            {organizationData && (
                                <Box display="flex" flexDirection="column" alignItems="center">
                                    <Box
                                        as="img"
                                        src={organizationData.logoUrl}
                                        alt={organizationData.name}
                                        boxSize="100px"
                                        borderRadius="full"
                                        mb={2}
                                    />
                                    <Text fontSize="lg" fontWeight="bold">Organization: {organizationData.name}</Text>
                                </Box>
                            )}
                        </Flex>
                        <Box>
                            <Flex>
                                <Text fontWeight="bold" mr={2}>Username:</Text>
                                <Text>{userData.username}</Text>
                            </Flex>
                            <Flex>
                                <Text fontWeight="bold" mr={2}>First Name:</Text>
                                <Text>{userData.firstName}</Text>
                            </Flex>
                            <Flex>
                                <Text fontWeight="bold" mr={2}>Last Name:</Text>
                                <Text>{userData.lastName}</Text>
                            </Flex>
                            <Flex>
                                <Text fontWeight="bold" mr={2}>Points:</Text>
                                <Text>{userData.points}</Text>
                            </Flex>
                        </Box>
                        <Flex mt={4} justifyContent="space-between">
                            {(currentUserData?.role === 'organizer' || currentUserData?.role === 'admin') && (
                                <>
                                    <Button
                                        colorScheme="blue"
                                        onClick={openNotificationModal}
                                    >
                                        Send Notification
                                    </Button>
                                    {currentUserData?.role === 'admin' && (
                                        <Button
                                            colorScheme={userData.banned ? 'green' : 'red'}
                                            onClick={handleBanUnbanUser}
                                        >
                                            {userData.banned ? 'Unban' : 'Ban'}
                                        </Button>
                                    )}
                                </>
                            )}
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <NotificationModal
                isOpen={isNotificationModalOpen}
                onClose={closeNotificationModal}
                recipientUid={userData?.username}
                quizzes={privateQuizzes || []}
                onInvite={handleInviteUserToQuiz}
            />
        </>
    );
}

UserProfileModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    username: PropTypes.string.isRequired,
    onBanUnban: PropTypes.func,
};