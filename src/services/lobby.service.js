import { db } from '../config/firebase-config';
import { ref, set, get, onValue, update, remove } from 'firebase/database';

// CREATE

export const addUserToLobby = async (username) => {
    try {
        const userRef = ref(db, `lobby/${username}`);
        await set(userRef, {
            username: username,
            status: 'waiting',
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error('Error adding user to lobby:', error);
        throw new Error('Failed to add user to lobby');
    }
};

// RETRIEVE

export const fetchLobbyUsers = async () => {
    try {
        const lobbyRef = ref(db, 'lobby');
        const snapshot = await get(lobbyRef);
        return snapshot.val() ? Object.values(snapshot.val()) : [];
    } catch (error) {
        console.error('Error fetching lobby users:', error);
        throw new Error('Failed to fetch lobby users');
    }
};

export const subscribeToLobbyUpdates = (callback) => {
    try {
        const lobbyRef = ref(db, 'lobby');
        const unsubscribe = onValue(lobbyRef, (snapshot) => {
            const users = snapshot.val() ? Object.values(snapshot.val()) : [];
            callback(users);
        });
        return unsubscribe;
    } catch (error) {
        console.error('Error subscribing to lobby updates:', error);
        throw new Error('Failed to subscribe to lobby updates');
    }
};

// UPDATE

export const updateUserStatus = async (username, status) => {
    try {
        const userRef = ref(db, `lobby/${username}`);
        await update(userRef, { status });
    } catch (error) {
        console.error('Error updating user status:', error);
        throw new Error('Failed to update user status');
    }
};

// DELETE

export const removeUserFromLobby = async (username) => {
    try {
        const userRef = ref(db, `lobby/${username}`);
        await remove(userRef);
    } catch (error) {
        console.error('Error removing user from lobby:', error);
        throw new Error('Failed to remove user from lobby');
    }
};
