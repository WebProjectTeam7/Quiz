import { ref as dbRef, push, get, update, set, remove, query, orderByChild, equalTo } from 'firebase/database';
import { ref as storageRef, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase-config';

// CREATE

export const createQuestion = async (question) => {
    try {
        const questionRef = push(dbRef(db, 'questions'));
        const questionId = questionRef.key;
        const imageUrl = question.imageFile ? await uploadQuestionImage(questionId, question.imageFile) : null;
        const newQuestion = {
            ...question,
            imageUrl,
            createdAt: new Date().toISOString(),
        };
        await set(questionRef, newQuestion);
        return questionId;
    } catch (error) {
        console.error('Error creating question:', error);
        throw new Error('Failed to create question');
    }
};

export const uploadQuestionImage = async (questionId, file) => {
    try {
        const imageRef = storageRef(storage, `questions/${questionId}/${file.name}`);
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);
        return imageUrl;
    } catch (error) {
        console.error('Error uploading question image:', error);
        throw new Error('Failed to upload question image');
    }
};

// RETRIEVE

export const getQuestionById = async (questionId) => {
    try {
        const questionRef = dbRef(db, `questions/${questionId}`);
        const snapshot = await get(questionRef);
        if (!snapshot.exists()) {
            return null;
        }
        return snapshot.val();
    } catch (error) {
        console.error('Error fetching question by ID:', error);
        throw new Error('Failed to retrieve question', { cause: error });
    }
};

export const getQuestionsByQuizId = async (quizId) => {
    try {
        const questionsRef = dbRef(db, 'questions');
        const questionsQuery = query(questionsRef, orderByChild('quizId'), equalTo(quizId));
        const snapshot = await get(questionsRef, questionsQuery);
        if (!snapshot.exists()) {
            return null;
        }
        const questionsObject = snapshot.val();
        const questionsArray = Object.keys(questionsObject).map((key) => ({
            id: key,
            ...questionsObject[key]
        }));

        return questionsArray;
    } catch (error) {
        console.error('Error fetching question by ID:', error);
        throw new Error('Failed to retrieve question', { cause: error });
    }
};

// UPDATE

export const editQuestion = async (questionId, updatedData, newImageFile) => {
    try {
        const questionRef = dbRef(db, `questions/${questionId}`);
        const snapshot = await get(questionRef);
        if (!snapshot.exists()) {
            throw new Error('Question not found');
        }
        let imageUrl = snapshot.val().imageUrl;
        if (newImageFile) {
            if (imageUrl) {
                const oldImageRef = storageRef(storage, imageUrl);
                await deleteObject(oldImageRef);
            }
            imageUrl = await uploadQuestionImage(questionId, newImageFile);
        }
        const updateQuestion = {
            ...snapshot.val(),
            ...updatedData,
            imageUrl,
            updatedAt: new Date().toISOString(),
        };
        await update(questionRef, updateQuestion);
        return updateQuestion;
    } catch (error) {
        console.error('Error updating question:', error);
        throw new Error('Failed to update question', { cause: error });
    }
};

// DELETE

export const deleteQuestion = async (questionId) => {
    try {
        const questionRef = dbRef(db, `questions/${questionId}`);
        const snapshot = await get(questionRef);
        if (!snapshot.exists()) {
            throw new Error('Question not found');
        }
        const questionData = snapshot.val();
        if (questionData.imageUrl) {
            const imageRef = storageRef(storage, questionData.imageUrl);
            await deleteObject(imageRef);
        }
        await remove(questionRef);
    } catch (error) {
        console.error('Error deleting question', error);
        throw new Error('Failed to delete question', { cause: error });
    }
};
