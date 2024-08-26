import { get, ref, remove, set } from 'firebase/database';
import { db } from '../config/firebase-config';


// REPORT BUGS
export const getReportedBugs = async () => {
    const reportsRef = ref(db, 'reports');
    try {
        const snapshot = await get(reportsRef);
        if (!snapshot.exists()) {
            return [];
        }
        return Object.values(snapshot.val());
    } catch (error) {
        console.error('Error fetching reports:', error);
        throw new Error('Failed to fetch reports');
    }
};

export const deleteReportedBugs = async (reportId) => {
    const reportRef = ref(db, `reports/${reportId}`);
    try {
        await remove(reportRef);
    } catch (error) {
        console.error('Error deleting report:', error);
        throw new Error('Failed to delete report');
    }
};

// DELETE

export const deleteUser = async (uid, username, email) => {
    try {
        const userRef = ref(db, `users/${uid}`);
        await remove(userRef);

        const deletedUsernamesRef = ref(db, `deletedUsernames/${username}`);
        const deletedEmailsRef = ref(db, 'deletedEmails/email');
        await set(deletedUsernamesRef, username);
        await set(deletedEmailsRef, email);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error('Failed to delete user');
    }
};
// BAN

export const banUser = async (uid, username, email) => {
    const bannedUserRef = ref(db, `bannedUsers/${uid}`);
    try {
        await set(bannedUserRef, { username, email });
    } catch (error) {
        console.error('Error banning user:', error);
        throw new Error('Failed to ban user');
    }
};

export const unbanUser = async (uid) => {
    const bannedUserRef = ref(db, `bannedUsers/${uid}`);
    try {
        await remove(bannedUserRef);
    } catch (error) {
        console.error('Error unbanning user:', error);
        throw new Error('Failed to unban user');
    }
};

export const getAllBannedUsers = async () => {
    try {
        const bannedUsersRef = ref(db, 'bannedUsers');
        const snapshot = await get(bannedUsersRef);
        if (!snapshot.exists()) {
            return [];
        }
        const bannedUsers = Object.keys(snapshot.val()).map((key) => ({
            uid: key,
            ...snapshot.val()[key],
        }));
        return bannedUsers;
    } catch (error) {
        console.error('Error retrieving banned users:', error.message);
        throw new Error('Failed to retrieve banned users');
    }
};
