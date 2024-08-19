import { ref as dbRef, push, get, update, set, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase-config';

// CREATE

export const createQuiz = async (quiz) => {
    try {
        const quizRef = push(dbRef(db, 'quizzes'));
        const quizId = quizRef.key;
        const imageUrl = quiz.imageFile ? await uploadQuizImage(quizId, quiz.imageFile) : null;
        const newQuiz = {
            ...quiz,
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
