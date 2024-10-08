import { get, set, ref, query, equalTo, orderByChild, update, remove, onValue, onDisconnect } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase-config';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

// CREATE

export const createUser = async (username, uid, email, firstName, lastName, role, phoneNumber, organizerCode = null) => {
    const user = { username, uid, email, firstName, lastName, role, phoneNumber, points: 0, organizerCode, createdOn: new Date().toString() };
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

        const user = snapshot.val();
        const bannedRef = ref(db, `bannedUsers/${user.uid}`);
        const bannedSnapshot = await get(bannedRef);
        const isBanned = bannedSnapshot.exists();

        return { ...user, banned: isBanned };
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

        const userData = snapshot.val();
        const userKey = Object.keys(userData)[0];
        return userData[userKey];
    } catch (error) {
        console.error('Error retrieving user data:', error);
        throw new Error('Failed to retrieve user data: ' + error.message);
    }
};


export const getUserPoints = async (username) => {
    const userRef = ref(db, `users/${username}`);
    try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            throw new Error('User not found');
        }

        const user = snapshot.val();
        return user.points || 0;
    } catch (error) {
        console.error('Error retrieving user points:', error);
        throw new Error('Failed to retrieve user points: ' + error.message);
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

export const getOrganizerCodes = async () => {
    const codesRef = ref(db, 'organizerCodes');
    try {
        const snapshot = await get(codesRef);
        if (!snapshot.exists()) {
            return [];
        }
        return Object.keys(snapshot.val());
    } catch (error) {
        console.error('Error retrieving organizer codes:', error);
        throw new Error('Failed to retrieve organizer codes: ' + error.message);
    }
};

export const monitorUserStatus = (uid) => {
    const userStatusDatabaseRef = ref(db, `status/${uid}`);

    const isOfflineForDatabase = {
        state: 'offline',
        last_changed: Date.now(),
    };

    const isOnlineForDatabase = {
        state: 'online',
        last_changed: Date.now(),
    };

    onValue(ref(db, '.info/connected'), (snapshot) => {
        if (snapshot.val() === false) {
            return;
        }

        onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
            set(userStatusDatabaseRef, isOnlineForDatabase);
        });
    });
};

export const getUserStatus = (uid, callback) => {
    const userStatusDatabaseRef = ref(db, `status/${uid}`);

    const unsubscribe = onValue(userStatusDatabaseRef, (snapshot) => {
        const status = snapshot.val();
        const isOnline = status && status.state === 'online';
        callback(isOnline);
    });

    return unsubscribe;
};

export const getAllUsers = async () => {
    try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (!snapshot.exists()) {
            return [];
        }
        const users = Object.keys(snapshot.val()).map((key) => ({
            username: key,
            ...snapshot.val()[key],
        }));

        return users;
    } catch (error) {
        console.error('Error retrieving all users:', error.message);
        throw new Error('Failed to retrieve all users');
    }
};

// export const getUserCount = async () => {
//     try {
//         const usersRef = query(ref(db, 'users'));
//         const snapshot = await get(usersRef);
//         if (!snapshot.exists()) {
//             return 0;
//         }
//         return Object.keys(snapshot.val()).length;
//     } catch (error) {
//         console.error('Error retrieving users count:', error);
//         throw new Error('Failed to retrieve users count: ' + error.message);
//     }
// };

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

export const changeUserPassword = async (newPassword) => {
    try {
        const user = auth.currentUser;
        if (user) {
            await updatePassword(user, newPassword);
        } else {
            throw new Error('User is not authenticated');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        throw new Error('Failed to change password: ' + error.message);
    }
};

export const reauthenticateUser = async (password) => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User is not authenticated');
    }

    const credential = EmailAuthProvider.credential(user.email, password);

    try {
        await reauthenticateWithCredential(user, credential);
    } catch (error) {
        console.error('Error re-authenticating user:', error);
        throw new Error('Failed to re-authenticate user: ' + error.message);
    }
};

export const updateUserWithOrganization = async (uid, organizationId, organizationName) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            throw new Error('User not found');
        }
        const userId = Object.keys(snapshot.val())[0];
        const updatedData = {
            organizationId: organizationId,
            organizationName: organizationName,
        };
        await update(ref(db, `users/${userId}`), updatedData);
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user: ' + error.message);
    }
};

// DELETE

export const deleteOrganizerCode = async (code) => {
    const codeRef = ref(db, `organizerCodes/${code}`);
    try {
        await remove(codeRef);
    } catch (error) {
        console.error('Error deleting organizer code:', error);
        throw new Error('Failed to delete organizer code: ' + error.message);
    }
};

