import { get, ref, remove } from 'firebase/database';
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

export const deleteUser = async (username) => {
    try {
        const userRef = ref(db, `users/${username}`);
        await remove(userRef);
    } catch (error) {
        console.error('Error deleting user:', error.message);
        throw new Error('Failed to delete user');
    }
};
