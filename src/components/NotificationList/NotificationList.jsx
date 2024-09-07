import {
    Box,
    Text,
    Button,
    VStack,
    HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
} from '@chakra-ui/react';
import { useEffect, useState, useContext } from 'react';
import { deleteNotification, getNotifications } from '../../services/notification.service';
import { AppContext } from '../../state/app.context';
import PropTypes from 'prop-types';
import { NotificationEnum } from '../../common/notification-enum';
import { updateUserWithOrganization } from '../../services/organization.service';
import Swal from 'sweetalert2';
import { getQuizById } from '../../services/quiz.service';
import { useNavigate } from 'react-router-dom';

export default function NotificationList({ isOpen, onClose, onNotificationsChange }) {
    const { userData } = useContext(AppContext);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications(userData.uid);
    }, [userData]);

    const fetchNotifications = async (uid) => {
        try {
            const notificationsData = await getNotifications(uid);
            setNotifications(notificationsData);
            onNotificationsChange(notificationsData);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await deleteNotification(userData.uid, notificationId);
            const updatedNotifications = notifications.filter(n => n.id !== notificationId);
            setNotifications(updatedNotifications);
            onNotificationsChange(updatedNotifications);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleAcceptNotification = async (notification) => {
        try {
            if (notification.type === NotificationEnum.INVITE_TO_ORGANIZATION) {
                const organizationName = notification.organizationName;
                const organizationId = notification.organizationId;

                await updateUserWithOrganization(userData.username, organizationId, organizationName);
                Swal.fire({
                    icon: 'success',
                    title: 'Joined Organization',
                    text: `You have successfully joined the organization ${organizationName}.`,
                    confirmButtonText: 'OK',
                });
            } else if (notification.type === NotificationEnum.INVITE_TO_QUIZ) {
                await handleAcceptInvite(notification);
            }
        } catch (error) {
            console.error('Error accepting notification:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to accept the invitation: ${error.message}`,
                confirmButtonText: 'OK',
            });
        }
    };

    const handleAcceptInvite = async (notification) => {
        try {
            const quizData = await getQuizById(notification.quizId);

            if (!quizData) {
                throw new Error('Quiz not found');
            }

            await deleteNotification(userData.uid, notification.id);
            navigate(`/play-quiz/${notification.quizId}`, { state: { quizData } });
        } catch (error) {
            console.error('Error accepting quiz invitation:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to load the quiz: ${error.message}`,
                confirmButtonText: 'OK',
            });
        }
    };

    const handleDeclineNotification = async (notification) => {
        try {
            await deleteNotification(userData.uid, notification.id);
            const updatedNotifications = notifications.filter(n => n.id !== notification.id);
            setNotifications(updatedNotifications);
            onNotificationsChange(updatedNotifications);
            Swal.fire({
                icon: 'info',
                title: 'Declined',
                text: 'You have declined the invitation.',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error('Error declining notification:', error);
        }
    };

    if (notifications.length === 0) {
        return (
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Notifications</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>No notifications available.</Text>
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Notifications</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        {notifications.length === 0 ? (
                            <Text>No notifications available.</Text>
                        ) : (
                            notifications.map((notification) => (
                                <Box
                                    key={notification.id}
                                    p={4}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    mb={2}
                                    bg={'white'}
                                >
                                    <Text>{notification.message}</Text>
                                    {notification.type === NotificationEnum.INVITE_TO_QUIZ && (
                                        <>
                                            <Text>Quiz Title: {notification.quizTitle}</Text>
                                            <Text>Category: {notification.quizCategory}</Text>
                                            <Text>Difficulty: {notification.quizDifficulty}</Text>
                                            <Text>Points: {notification.quizPoints}</Text>
                                        </>
                                    )}

                                    {notification.type === NotificationEnum.INVITE_TO_ORGANIZATION || notification.type === NotificationEnum.INVITE_TO_QUIZ ? (
                                        <HStack spacing={4} mt={2}>
                                            <Button
                                                size="sm"
                                                colorScheme="green"
                                                onClick={() => handleAcceptNotification(notification)}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                colorScheme="red"
                                                onClick={() => handleDeclineNotification(notification)}
                                            >
                                                Decline
                                            </Button>
                                        </HStack>
                                    ) : (
                                        <Button
                                            size="sm"
                                            colorScheme="gray"
                                            onClick={() => handleDeleteNotification(notification.id)}
                                        >
                                            Delete
                                        </Button>
                                    )}
                                </Box>
                            ))
                        )}
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

NotificationList.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onNotificationsChange: PropTypes.func.isRequired,
};