import { browserLocalPersistence, createUserWithEmailAndPassword, setPersistence, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase-config';
import { ref as dbRef, set } from 'firebase/database';

setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Failed to set persistence:', error);
});

export const registerUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async (uid) => {
    if (uid) {
        const userStatusDatabaseRef = dbRef(db, `status/${uid}`);
        await set(userStatusDatabaseRef, {
            state: 'offline',
            last_changed: Date.now(),
        });
    }
    return signOut(auth);
};