import { ref, get, query } from 'firebase/database';
import { db } from '../config/firebase-config';

export const getQuizCount = async () => {
    try {
        const threadsRef = query(ref(db, 'threads'));
        const snapshot = await get(threadsRef);
        if (!snapshot.exists()) {
            return 0;
        }
        return Object.keys(snapshot.val()).length;
    } catch (error) {
        throw new Error('Failed to retrieve threads count: ' + error.message);
    }
};