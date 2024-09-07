/* eslint-disable consistent-return */
import { get, set, ref, remove, push, onValue, off } from 'firebase/database';
import { db } from '../config/firebase-config';

// CREATE

export const sendNotificationToUser = async (username, notificationData) => {
    try {
        const notificationsRef = ref(db, `notifications/${username}`);
        const newNotificationRef = push(notificationsRef);

        const notification = {
            ...notificationData,
            isRead: false,
            timestamp: Date.now(),
        };

        await set(newNotificationRef, notification);
    } catch (error) {
        console.error('Error sending notification:', error);
        throw new Error('Failed to send notification');
    }
};

// RETRIEVE

export const getNotifications = async (username) => {
    try {
        const notificationsRef = ref(db, `notifications/${username}`);
        const snapshot = await get(notificationsRef);

        if (snapshot.exists()) {
            const notificationsArray = Object.keys(snapshot.val()).map((key) => ({
                id: key,
                ...snapshot.val()[key],
            }));
            return notificationsArray;
        }
        return [];
    } catch (error) {
        console.error('Error retrieving notifications:', error);
        throw new Error('Failed to retrieve notifications');
    }
};

export const listenForNotifications = (username, onNotificationUpdate) => {
    try {
        const notificationsRef = ref(db, `notifications/${username}`);

        const unsubscribe = onValue(notificationsRef, (snapshot) => {
            if (snapshot.exists()) {
                const notificationsArray = Object.keys(snapshot.val()).map((key) => ({
                    id: key,
                    ...snapshot.val()[key],
                }));
                onNotificationUpdate(notificationsArray);
            } else {
                onNotificationUpdate([]);
            }
        });

        return () => off(notificationsRef, 'value', unsubscribe);
    } catch (error) {
        console.error('Error setting up notifications listener:', error);
    }
};

// UPDATE

export const markNotificationAsRead = async (username, notificationId) => {
    try {
        const notificationRef = ref(db, `notifications/${username}/${notificationId}`);
        const snapshot = await get(notificationRef);

        if (snapshot.exists()) {
            await set(notificationRef, {
                ...snapshot.val(),
                isRead: true,
            });
        } else {
            throw new Error('Notification not found');
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw new Error('Failed to mark notification as read');
    }
};

// DELETE

export const deleteNotification = async (username, notificationId) => {
    try {
        if (notificationId) {
            const notificationRef = ref(db, `notifications/${username}/${notificationId}`);
            await remove(notificationRef);
        }

        const notificationsRef = ref(db, `notifications/${username}`);
        const snapshot = await get(notificationsRef);

        if (!snapshot.exists()) {
            await remove(notificationsRef);
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw new Error('Failed to delete notification');
    }
};
