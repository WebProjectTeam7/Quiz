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
    Badge
} from '@chakra-ui/react';
import { useEffect, useState, useContext } from 'react';
import { deleteNotification, getNotifications, markNotificationAsRead } from '../../services/notification.service';
import { AppContext } from '../../state/app.context';
import PropTypes from 'prop-types';
import NotificationEnum from '../../common/notification-enum';
import { updateUserWithOrganization } from '../../services/organization.service';
import Swal from 'sweetalert2';

export default function NotificationList({ isOpen, onClose, onNotificationsChange }) {
    const { userData } = useContext(AppContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications(userData.username);
    }, [userData]);

    const fetchNotifications = async (username) => {
        try {
            const notificationsData = await getNotifications(username);
            setNotifications(notificationsData);
            onNotificationsChange(notificationsData);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await deleteNotification(userData.username, notificationId);
            const updatedNotifications = notifications.filter(n => n.id !== notificationId);
            setNotifications(updatedNotifications);
            onNotificationsChange(updatedNotifications);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
        fetchNotifications(userData.username);
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
        fetchNotifications(userData.username);
    };

    const handleAcceptInvite = async (notification) => {
        try {
            await markNotificationAsRead(userData.username, notification.id);
        } catch (error) {
            console.error('Error accepting quiz invitation:', error);
        }
        fetchNotifications(userData.username);
    };

    const handleDeclineNotification = async (notification) => {
        try {
            await markNotificationAsRead(userData.username, notification.id);
        } catch (error) {
            console.error('Error declining notification:', error);
        }
        fetchNotifications(userData.username);
    };

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const readNotifications = notifications.filter(n => n.isRead);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Notifications</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        {unreadNotifications.length > 0 && (
                            <Box>
                                <Text fontSize="lg" fontWeight="bold">New Notifications</Text>
                                {unreadNotifications.map((notification) => (
                                    <Box
                                        key={notification.id}
                                        p={4}
                                        borderWidth="1px"
                                        borderRadius="md"
                                        mb={2}
                                        bg={'white'}
                                        position="relative"
                                    >
                                        <Badge
                                            colorScheme="red"
                                            borderRadius="full"
                                            position="absolute"
                                            top={-1}
                                            right={-1}
                                            px={2}
                                            py={0.5}
                                            fontSize="0.75em"
                                        >
                                            New
                                        </Badge>
                                        <Text>{notification.message}</Text>
                                        {notification.type === NotificationEnum.INVITE_TO_QUIZ && (
                                            <>
                                                <Text>Quiz Title: {notification.quizTitle}</Text>
                                                <Text>Category: {notification.quizCategory}</Text>
                                                <Text>Difficulty: {notification.quizDifficulty}</Text>
                                                <Text>Points: {notification.quizPoints}</Text>
                                            </>
                                        )}
                                        <HStack spacing={4} mt={2}>
                                            <Button
                                                size="sm"
                                                colorScheme="green"
                                                onClick={() => handleAcceptNotification(notification)}
                                            >
                                                OK
                                            </Button>
                                        </HStack>
                                    </Box>
                                ))}
                            </Box>
                        )}
                        {readNotifications.length > 0 && (
                            <Box>
                                <Text fontSize="lg" fontWeight="bold">Read Notifications</Text>
                                {readNotifications.map((notification) => (
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
                                        <HStack spacing={4} mt={2}>
                                            <Button
                                                size="sm"
                                                colorScheme="gray"
                                                onClick={() => handleDeleteNotification(notification.id)}
                                            >
                                                Delete
                                            </Button>
                                        </HStack>
                                    </Box>
                                ))}
                            </Box>
                        )}
                        {unreadNotifications.length === 0 && readNotifications.length === 0 && (
                            <Text>No notifications available.</Text>
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
