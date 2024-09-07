/* eslint-disable consistent-return */
import { useEffect, useState, useContext } from 'react';
import { listenForNotifications } from '../services/notification.service';
import { AppContext } from '../state/app.context';

const useNotifications = () => {
    const { userData } = useContext(AppContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!userData?.username) return;

        const unsubscribe = listenForNotifications(userData.username, (allNotifications) => {
            const unreadNotifications = allNotifications.filter(notification => !notification.isRead);
            setNotifications(unreadNotifications);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userData?.username]);

    return notifications;
};

export default useNotifications;
