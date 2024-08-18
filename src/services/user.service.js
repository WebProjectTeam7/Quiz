import { get, set, ref, query, equalTo, orderByChild, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase-config';

// CREATE

export const createUser = async (username, uid, email, firstName, lastName, role, phoneNumber) => {
    const user = { username, uid, email, firstName, lastName, role, phoneNumber, points: 1000, createdOn: new Date().toString() };
    const userRef = ref(db, `users/${username}`);
    try {
        await set(userRef, user);
        return user;
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user: ' + error.message);
    }
};

// RETRIEVE
export const getUserByUsername = async (username) => {
    const userRef = ref(db, `users/${username}`);
    try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            return null;
        }
        return snapshot.val();
    } catch (error) {
        console.error('Error retrieving user by username:', error);
        throw new Error('Failed to retrieve user: ' + error.message);
    }
};


export const getUserData = async (uid) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            throw new Error('User not found');
        }
        return snapshot.val();
    } catch (error) {
        console.error('Error retrieving user data:', error);
        throw new Error('Failed to retrieve user data: ' + error.message);
    }
};

export const getPhoneNumber = async (phoneNumber) => {
    const phoneRef = query(ref(db, 'users'), orderByChild('phoneNumber'), equalTo(phoneNumber));
    try {
        const snapshot = await get(phoneRef);
        return snapshot.exists();
    } catch (error) {
        console.error('Error checking phone number:', error);
        throw new Error('Failed to check phone number: ' + error.message);
    }
};

export const getEmail = async (email) => {
    const emailRef = query(ref(db, 'users'), orderByChild('email'), equalTo(email));
    try {
        const snapshot = await get(emailRef);
        return snapshot.exists();
    } catch (error) {
        console.error('Error checking email:', error);
        throw new Error('Failed to check email: ' + error.message);
    }
};

// UPDATE

export const updateUser = async (uid, updatedData) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            throw new Error('User not found');
        }
        const userId = Object.keys(snapshot.val())[0];
        await update(ref(db, `users/${userId}`), updatedData);
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user: ' + error.message);
    }
};

export const uploadUserAvatar = async (uid, imageFile) => {
    try {
        const avatarRef = storageRef(storage, `avatars/${uid}`);
        const snapshot = await uploadBytes(avatarRef, imageFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
};

// DELETE