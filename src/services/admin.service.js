import { get, push, ref, remove, set } from 'firebase/database';
import { db } from '../config/firebase-config';

// REPORT BUGS
export const sendBugReport = async (quizId, questionId, userId, username, reason) => {
    try {
        const reportRef = push(ref(db, 'reports'));
        const newReport = {
            quizId,
            questionId,
            reportedBy: username,
            reportedAt: Date.now(),
            reason,
        };
        await set(reportRef, newReport);
    } catch (error) {
        console.error('Error reporting bug:', error.message);
        throw new Error('Failed to report the bug');
    }
};

export const reportBug = async (report) => {
    try {
        const reportRef = push(ref(db, 'reports'));
        await set(reportRef, report);
    } catch (error) {
        console.error('Failed to report bug:', error);
        throw new Error('Failed to report bug');
    }
};

export const getAllReportedBugs = async () => {
    try {
        const reportsRef = ref(db, 'reports');
        const snapshot = await get(reportsRef);
        if (!snapshot.exists()) {
            return [];
        }
        const reportsObject = snapshot.val();
        return Object.keys(reportsObject).map(key => ({
            id: key,
            ...reportsObject[key],
        }));
    } catch (error) {
        console.error('Failed to retrieve reports:', error);
        throw new Error('Failed to retrieve reports');
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
