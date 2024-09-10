import { db } from '../config/firebase-config';
import { ref, push, onValue, remove, get, query, orderByChild, limitToLast } from 'firebase/database';

// CREATE

export const sendMessage = async (username, message) => {
    const chatRef = ref(db, 'chat/');
    const newMessage = {
        sender: username,
        text: message,
        timestamp: Date.now(),
    };

    try {
        await push(chatRef, newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send message');
    }
};

// RETRIEVE

export const getChatMessages = (callback) => {
    const chatRef = ref(db, 'chat/');

    try {
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const messages = [];
            snapshot.forEach((childSnapshot) => {
                messages.push(childSnapshot.val());
            });
            callback(messages);
        });

        return () => unsubscribe();
    } catch (error) {
        console.error('Error getting chat messages:', error);
        throw new Error('Failed to get chat messages');
    }
};

// UPDATE

// DELETE

export const chatCleanUp = async (limit) => {
    const chatRef = ref(db, 'chat/');
    const recentMessagesQuery = query(chatRef, orderByChild('timestamp'), limitToLast(limit));

    try {
        const snapshot = await get(recentMessagesQuery);
        const messages = snapshot.val();
        if (messages) {
            const keepKeys = Object.keys(messages);
            const chatNodeRef = ref(db, 'chat/');
            const oldMessagesQuery = query(chatNodeRef, orderByChild('timestamp'), limitToLast(Number.MAX_SAFE_INTEGER));
            const oldMessagesSnapshot = await get(oldMessagesQuery);
            const oldMessages = oldMessagesSnapshot.val();
            if (oldMessages) {
                const oldKeys = Object.keys(oldMessages).filter(key => !keepKeys.includes(key));
                await Promise.all(oldKeys.map(key => remove(ref(db, `chat/${key}`))));
            }
        }
    } catch (error) {
        console.error('Error cleaning up chat messages:', error);
        throw new Error('Failed to clean up chat messages');
    }
};
