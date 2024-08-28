import { ref as dbRef, push, get, update, set, remove, query, orderByChild, equalTo } from 'firebase/database';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase-config';

// CREATE

export const createQuiz = async (quiz) => {
    try {
        const quizRef = push(dbRef(db, 'quizzes'));
        const quizId = quizRef.key;
        const newQuiz = {
            ...quiz,
            isActive: false,
            createdAt: new Date().toISOString(),
        };
        await set(quizRef, newQuiz);
        return quizId;
    } catch (error) {
        console.error('Error creating quiz:', error);
        throw new Error('Failed to create quiz');
    }
};

// RETRIEVE

export const getActiveQuizzes = async () => {
    try {
        const quizRef = dbRef(db, 'quizzes');
        const activeQuizzesQuery = query(quizRef, orderByChild('isActive'), equalTo(true));
        const snapshot = await get(activeQuizzesQuery);

        if (snapshot.exists()) {
            const activeQuizzes = [];
            snapshot.forEach((childSnapshot) => {
                activeQuizzes.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            return activeQuizzes;
        }
        return [];
    } catch (error) {
        console.error('Error retrieving active quizzes:', error);
        throw new Error('Failed to retrieve active quizzes');
    }
};

export const getQuizzesByCategory = async (categoryName) => {
    try {
        const quizRef = dbRef(db, 'quizzes');
        const categoryQuizzesQuery = query(quizRef, orderByChild('category'), equalTo(categoryName));
        const snapshot = await get(categoryQuizzesQuery);

        if (snapshot.exists()) {
            const categoryQuizzes = [];
            snapshot.forEach((childSnapshot) => {
                categoryQuizzes.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            return categoryQuizzes;
        }
        return [];
    } catch (error) {
        console.error('Error retrieving quizzes by category:', error);
        throw new Error('Failed to retrieve quizzes by category');
    }
};

export const getQuizById = async (quizId) => {
    try {
        const quizRef = dbRef(db, `quizzes/${quizId}`);
        const snapshot = await get(quizRef);
        if (!snapshot.exists()) {
            return null;
        }
        return snapshot.val();
    } catch (error) {
        console.error('Error fetching quiz by ID:', error);
        throw new Error('Failed to retrieve quiz');
    }
};

export const getQuizQuestionsIds = async (quizId) => {
    try {
        const quizRef = dbRef(db, `quizzes/${quizId}`);
        const snapshot = await get(quizRef);
        if (!snapshot.exists()) {
            throw new Error('Quiz not found');
        }
        const quizData = snapshot.val();
        const questions = quizData.questions || [];

        return questions;
    } catch (error) {
        console.error('Error fetching questions ids from quiz', error);
        throw new Error('Failed to retrieve questions ids from quiz');
    }
};

export const getQuizCount = async () => {
    try {
        const quizRef = query(dbRef(db, 'quizzes'));
        const snapshot = await get(quizRef);
        if (!snapshot.exists()) {
            return 0;
        }
        return Object.keys(snapshot.val()).length;
    } catch (error) {
        console.error('Error retrieving quizzes count:', error);
        throw new Error('Failed to retrieve quizzes count: ' + error.message);
    }
};

export const getQuizzesByAuthor = async (username) => {
    try {
        const quizRef = dbRef(db, 'quizzes');
        const authorQuery = query(quizRef, orderByChild('author'), equalTo(username));
        const snapshot = await get(authorQuery);
        if (!snapshot.exists()) {
            return [];
        }
        const quizzes = snapshot.val();
        return Object.keys(quizzes).map(key => ({
            id: key,
            ...quizzes[key]
        }));
    } catch (error) {
        console.error('Error retrieving quizzes by username:', error);
        throw new Error('Failed to retrieve quizzes by username');
    }
};
export const getQuizzesByOrganizationId = async (organizationId) => {
    try {
        const quizRef = dbRef(db, 'quizzes');
        const organizationQuery = query(quizRef, orderByChild('organizationId'), equalTo(organizationId));
        const snapshot = await get(organizationQuery);
        if (!snapshot.exists()) {
            return [];
        }
        return snapshot.val();
    } catch (error) {
        console.error('Error retrieving quizzes by organization ID:', error);
        throw new Error('Failed to retrieve quizzes by organization ID');
    }
};


// UPDATE

export const editQuiz = async (quizId, updatedData) => {
    try {
        const quizRef = dbRef(db, `quizzes/${quizId}`);
        const snapshot = await get(quizRef);
        if (!snapshot.exists()) {
            throw new Error('Quiz not found');
        }
        const updatedQuiz = {
            ...snapshot.val(),
            ...updatedData,
            updatedAt: new Date().toISOString(),
        };
        await update(quizRef, updatedQuiz);
        return updatedQuiz;
    } catch (error) {
        console.error('Error updating quiz:', error);
        throw new Error('Failed to update quiz');
    }
};

export const removeQuestionFromQuiz = async (quizId, questionId) => {
    try {
        const quizRef = dbRef(db, `quizzes/${quizId}`);
        const snapshot = await get(quizRef);
        if (!snapshot.exists()) {
            throw new Error('Quiz not found');
        }
        const quizData = snapshot.val();
        const questions = quizData.questions || [];
        const updatedQuestions = questions.filter(id => id !== questionId);
        await update(quizRef, { questions: updatedQuestions });
    } catch (error) {
        console.error('Error removing question from quiz:', error);
        throw new Error('Failed to remove question from quiz');
    }
};

export const updateQuestionsIdsArray = async (quizId, questionsArray) => {
    try {
        const quizRef = dbRef(db, `quizzes/${quizId}`);
        const snapshot = await get(quizRef);
        if (!snapshot.exists()) {
            throw new Error('Quiz not found');
        }
        const updatedQuiz = {
            ...snapshot.val(),
            questions: questionsArray,
            updatedAt: new Date().toISOString(),
        };
        await update(quizRef, updatedQuiz);
        return updatedQuiz;
    } catch (error) {
        console.error('Error updating questions IDs:', error);
        throw new Error('Failed to update questions IDs');
    }
};

export const submitQuizResults = async () => {
};

// DELETE

export const deleteQuiz = async (quizId) => {
    try {
        const quizRef = dbRef(db, `quizzes/${quizId}`);
        const snapshot = await get(quizRef);
        if (!snapshot.exists()) {
            throw new Error('Quiz not found');
        }
        const quizData = snapshot.val();
        if (quizData.imageUrl) {
            const imageRef = storageRef(storage, quizData.imageUrl);
            await deleteObject(imageRef);
        }
        await remove(quizRef);
    } catch (error) {
        console.error('Error deleting quiz:', error);
        throw new Error('Failed to delete quiz');
    }
};
