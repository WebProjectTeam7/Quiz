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
import { useContext } from 'react';
import { deleteNotification, markNotificationAsRead } from '../../services/notification.service';
import { AppContext } from '../../state/app.context';
import PropTypes from 'prop-types';
import NotificationEnum from '../../common/notification-enum';
import { joinOrganization } from '../../services/organization.service';
import Swal from 'sweetalert2';
import useNotifications from '../../custom-hooks/UseNotifications';

export default function NotificationList({ isOpen, onClose }) {
    const { userData } = useContext(AppContext);

    const { notifications, newNotifications } = useNotifications();

    const handleDeleteNotification = async (notificationId) => {
        try {
            await deleteNotification(userData.username, notificationId);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleAcceptNotification = async (notification) => {
        try {
            if (notification.type === NotificationEnum.INVITE_TO_ORGANIZATION) {
                const { organizationId, organizationName } = notification;
                await joinOrganization(userData.username, organizationId, organizationName);
                Swal.fire({
                    icon: 'success',
                    title: 'Joined Organization',
                    text: `You have successfully joined the organization ${organizationName}.`,
                    confirmButtonText: 'OK',
                });
            }
            handleReadNotification(notification);
        } catch (error) {
            console.error('Error accepting notification:', error);
        }
    };

    const handleReadNotification = async (notification) => {
        try {
            await markNotificationAsRead(userData.username, notification.id);
        } catch (error) {
            console.error('Error marking notification as read', error);
        }
    };


    const unreadNotifications = newNotifications;
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
                                                <HStack spacing={4} mt={2}>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="green"
                                                        onClick={() => handleReadNotification(notification)}
                                                    >
                                                        OK
                                                    </Button>
                                                </HStack>
                                            </>
                                        )}
                                        {notification.type === NotificationEnum.INVITE_TO_ORGANIZATION && (
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
                                                    onClick={() => handleReadNotification(notification)}
                                                >
                                                    Decline
                                                </Button>
                                            </HStack>
                                        )}
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
        </Modal >
    );
}

NotificationList.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onNotificationsChange: PropTypes.func.isRequired,
};
