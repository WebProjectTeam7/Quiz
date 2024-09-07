import { get, set, ref, remove, push } from 'firebase/database';
import { db } from '../config/firebase-config';

export const sendNotification = async (uid, notificationData) => {
    const notificationRef = ref(db, `notifications/${uid}`);
    const newNotificationRef = push(notificationRef);
    await set(newNotificationRef, {
        ...notificationData,
        timestamp: Date.now(),
    });
};

export const getNotifications = async (uid) => {
    const notificationsRef = ref(db, `notifications/${uid}`);
    const snapshot = await get(notificationsRef);

    if (snapshot.exists()) {
        const notificationsArray = Object.keys(snapshot.val()).map((key) => ({
            id: key,
            ...snapshot.val()[key],
        }));
        return notificationsArray;
    }
    return [];

};

export const sendNotificationToUser = async (uid, notificationData) => {
    try {
        const notificationsRef = ref(db, `notifications/${uid}`);
        const newNotificationRef = push(notificationsRef);

        const notification = {
            ...notificationData,
            timestamp: Date.now(),
        };

        await set(newNotificationRef, notification);
    } catch (error) {
        console.error('Error sending notification:', error);
        throw new Error('Failed to send notification');
    }
};

export const deleteNotification = async (uid, notificationId) => {
    try {
        if (notificationId) {
            const notificationRef = ref(db, `notifications/${uid}/${notificationId}`);
            await remove(notificationRef);
        }

        const notificationsRef = ref(db, `notifications/${uid}`);
        const snapshot = await get(notificationsRef);

        if (!snapshot.exists()) {
            await remove(notificationsRef);
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
    }
};