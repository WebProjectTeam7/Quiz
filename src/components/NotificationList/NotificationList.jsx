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

export default function NotificationList({ isOpen, onClose }) {
    const { userData } = useContext(AppContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications(userData.uid);
    }, [userData]);

    const fetchNotifications = async (uid) => {
        try {
            const notificationsData = await getNotifications(uid);
            setNotifications(notificationsData);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await deleteNotification(userData.uid, notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleAcceptNotification = (notification) => {
        console.log('Accepted:', notification);
    };

    const handleDeclineNotification = (notification) => {
        console.log('Declined:', notification);
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
                                    bg={notification.status === 'unread' ? 'gray.100' : 'white'}
                                >
                                    <Text>{notification.message}</Text>
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
                                        <Button
                                            size="sm"
                                            colorScheme="gray"
                                            onClick={() => handleDeleteNotification(notification.id)}
                                        >
                                            Delete
                                        </Button>
                                    </HStack>
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
};