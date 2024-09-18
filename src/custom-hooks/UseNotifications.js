/* eslint-disable consistent-return */
import { useEffect, useState, useContext } from 'react';
import { listenForNotifications } from '../services/notification.service';
import { AppContext } from '../state/app.context';

export default function useNotifications() {
    const { userData } = useContext(AppContext);
    const [notifications, setNotifications] = useState([]);
    const [newNotifications, setNewNotifications] = useState([]);

    useEffect(() => {
        if (!userData?.username) return;

        const unsubscribe = listenForNotifications(userData.username, (allNotifications) => {
            setNotifications(allNotifications);
            const unreadNotifications = allNotifications.filter(notification => !notification.isRead);
            setNewNotifications(unreadNotifications);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userData?.username]);

    return { notifications, newNotifications };
}
