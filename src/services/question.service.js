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
            id: questionId,
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

export const getRandomQuestion = async () => {
    try {
        const questionsRef = dbRef(db, 'questions');
        const queryRef = query(questionsRef, orderByChild('access'), equalTo('public'));
        const snapshot = await get(queryRef);

        if (!snapshot.exists()) {
            throw new Error('No questions available');
        }

        const questionsObject = snapshot.val();
        const questionsArray = Object.keys(questionsObject).map((key) => ({
            id: key,
            ...questionsObject[key]
        }));

        const randomIndex = Math.floor(Math.random() * questionsArray.length);
        return questionsArray[randomIndex];
    } catch (error) {
        console.error('Error fetching random question:', error);
        throw new Error('Failed to retrieve a random question', { cause: error });
    }
};

// UPDATE

export const updateQuestion = async (questionId, updatedData) => {
    try {
        const questionRef = dbRef(db, `questions/${questionId}`);
        const snapshot = await get(questionRef);

        if (!snapshot.exists()) {
            throw new Error('Question not found');
        }

        const oldQuestionData = snapshot.val();
        let imageUrl = oldQuestionData.imageUrl ?? null;

        if (updatedData.imageFile) {
            if (imageUrl) {
                const oldImageRef = storageRef(storage, imageUrl);
                await deleteObject(oldImageRef);
            }
            imageUrl = await uploadQuestionImage(questionId, updatedData.imageFile);
        } else if (imageUrl && !updatedData.imageFile || updatedData.imageUrl === null) {
            const oldImageRef = storageRef(storage, imageUrl);
            await deleteObject(oldImageRef);
            imageUrl = null;
        }

        const updateQuestionData = {
            ...oldQuestionData,
            ...updatedData,
            imageUrl,
            updatedAt: new Date().toISOString(),
        };

        await update(questionRef, updateQuestionData);
        return updateQuestionData;
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
