import { ref as dbRef, get, query, orderByChild, push, update, set, remove, equalTo } from 'firebase/database';
import { db } from '../config/firebase-config';

// CREATE

export const createQuiz = async (title) => {
    try {
        const quizRef = dbRef(db, 'quizzes');


    } catch (error) {
        console.error('Error creating quiz:', error);
        throw new Error('Failed to create quiz');
    }
};
// RETRIEVE

// UPDATE

// DELETE