import { useEffect, useState, useContext } from 'react';
import { deleteNotification, getNotifications, markNotificationAsRead } from '../../services/user.service';
import { AppContext } from '../../state/app.context';
import { Box, Text, Badge, Button } from '@chakra-ui/react';

export default function NotificationList() {
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


    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(userData.uid, notificationId);
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, status: 'read' }
                        : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await deleteNotification(userData.uid, notificationId);

            await fetchNotifications(userData.uid);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    if (notifications.length === 0) {
        return <Text>No notifications</Text>;
    }

    return (
        <Box>
            {notifications.map((notification) => (
                <Box
                    key={notification.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    mb={2}
                    onClick={() => handleMarkAsRead(notification.id)}
                >
                    <Text>{notification.message}</Text>
                    {notification.status === 'unread' && (
                        <Badge colorScheme="red" ml={2}>New</Badge>
                    )}
                    <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => handleDeleteNotification(notification.id)}
                    >
                                Delete
                    </Button>
                </Box>
            ))}
        </Box>
    );
}
