import { useEffect, useState, useContext } from 'react';
import { deleteNotification, getNotifications, markNotificationAsRead } from '../../services/user.service';
import { AppContext } from '../../state/app.context';
import { Box, Text, Badge, Button } from '@chakra-ui/react';

export default function NotificationList() {
    const { userData } = useContext(AppContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!userData) return;

        const unsubscribe = getNotifications(userData.uid, setNotifications);

        return () => unsubscribe();
    }, [userData]);

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
            setNotifications((prevNotifications) =>
                prevNotifications.filter((notification) => notification.id !== notificationId)
            );
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
                    <Badge colorScheme={notification.status === 'unread' ? 'red' : 'green'}>
                        {notification.status}
                    </Badge>
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
