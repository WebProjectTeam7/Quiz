import { ref as dbRef, push, get, update, set, remove, query, orderByChild, equalTo } from 'firebase/database';
import { ref as storageRef, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase-config';


// CREATE

export const createQuiz = async (quiz) => {
    try {
        const quizRef = push(dbRef(db, 'quizzes'));
        const quizId = quizRef.key;
        const imageUrl = quiz.imageFile ? await uploadQuizImage(quizId, quiz.imageFile) : null;
        const newQuiz = {
            author: quiz.author,
            type: quiz.type,
            title: quiz.title,
            description: quiz.description,
            category: quiz.category,
            timesPlayed: 0,
            totalPoints: quiz.totalPoints,
            difficulty: quiz.difficulty,
            dateBegins: quiz.dateBegins,
            dateEnds: quiz.dateEnds,
            timeLimit: quiz.timeLimit,
            imageUrl,
            createdAt: new Date().toISOString(),
        };
        await set(quizRef, newQuiz);
        return quizId;
    } catch (error) {
        console.error('Error creating quiz:', error);
        throw new Error('Failed to create quiz');
    }
};

export const uploadQuizImage = async (quizId, file) => {
    try {
        const imageRef = storageRef(storage, `quizzes/${quizId}/${file.name}`);
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);
        return imageUrl;
    } catch (error) {
        console.error('Error uploading quiz image:', error);
        throw new Error('Failed to upload quiz image');
    }
};


// RETRIEVE

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
        return snapshot.val();
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

export const editQuiz = async (quizId, updatedData, newImageFile) => {
    try {
        const quizRef = dbRef(db, `quizzes/${quizId}`);
        const snapshot = await get(quizRef);
        if (!snapshot.exists()) {
            throw new Error('Quiz not found');
        }
        let imageUrl = snapshot.val().imageUrl;
        if (newImageFile) {
            if (imageUrl) {
                const oldImageRef = storageRef(storage, imageUrl);
                await deleteObject(oldImageRef);
            }
            imageUrl = await uploadQuizImage(quizId, newImageFile);
        }
        const updatedQuiz = {
            ...snapshot.val(),
            ...updatedData,
            imageUrl,
            updatedAt: new Date().toISOString(),
        };
        await update(quizRef, updatedQuiz);
        return updatedQuiz;
    } catch (error) {
        console.error('Error updating quiz:', error);
        throw new Error('Failed to update quiz');
    }
};

export const addQuestionToQuiz = async (quizId, questionId) => {
    try {
        const quizRef = dbRef(db, `quizzes/${quizId}`);
        const snapshot = await get(quizRef);
        if (!snapshot.exists()) {
            throw new Error('Quiz not found');
        }
        const quizData = snapshot.val();
        const questions = quizData.questions || [];
        if (!questions.includes(questionId)) {
            questions.push(questionId);
        }
        await update(quizRef, { questions });
    } catch (error) {
        console.error('Error adding question to quiz:', error);
        throw new Error('Failed to add question to quiz');
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
