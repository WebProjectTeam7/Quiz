import { ref as dbRef, push, get, update, set, remove, query, orderByChild, equalTo } from 'firebase/database';
import { ref as storageRef, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase-config';


// CREATE

export const createOrganization = async (organization) => {
    try {
        const orgRef = push(dbRef(db, 'organizations'));
        await set(orgRef, organization);
        return { id: orgRef.key, ...organization };
    } catch (error) {
        console.error('Error creating organization:', error);
        throw new Error('Failed to create organization');
    }
};

// export const uploadOrganizationLogo = async (orgId, file) => {
//     try {

//     } catch (error) {
//         console.error('Error uploading organization logo:', error);
//         throw new Error('Failed to upload organization logo');
//     }
// };


// RETRIEVE

// export const getOrganizationById = async (orgId) => {
//     try {

//     } catch (error) {
//         console.error('Error fetching organization by ID:', error);
//         throw new Error('Failed to retrieve organization');
//     }
// };

// export const getQuizQuestionsIds = async (orgId) => {
//     try {
//     } catch (error) {
//         console.error('Error fetching questions ids from quiz', error);
//         throw new Error('Failed to retrieve questions ids from quiz');
//     }
// };


// UPDATE

// export const editOrganization = async (quizId, updatedData, newImageFile) => {
//     try {
//         const quizRef = dbRef(db, `quizzes/${quizId}`);
//         const snapshot = await get(quizRef);
//         if (!snapshot.exists()) {
//             throw new Error('Quiz not found');
//         }
//         let imageUrl = snapshot.val().imageUrl;
//         if (newImageFile) {
//             if (imageUrl) {
//                 const oldImageRef = storageRef(storage, imageUrl);
//                 await deleteObject(oldImageRef);
//             }
//             imageUrl = await uploadQuizImage(quizId, newImageFile);
//         }
//         const updatedQuiz = {
//             ...snapshot.val(),
//             ...updatedData,
//             imageUrl,
//             updatedAt: new Date().toISOString(),
//         };
//         await update(quizRef, updatedQuiz);
//         return updatedQuiz;
//     } catch (error) {
//         console.error('Error updating quiz:', error);
//         throw new Error('Failed to update quiz');
//     }
// };

// export const addQuizIdToOrganization = async (orgId, quizId) => {
//     try {
//     } catch (error) {
//         console.error('Error adding question to quiz:', error);
//         throw new Error('Failed to add question to quiz');
//     }
// };

// export const removeQuizIdFromOrganization = async (quizId, questionId) => {
//     try {
//         const quizRef = dbRef(db, `quizzes/${quizId}`);
//         const snapshot = await get(quizRef);
//         if (!snapshot.exists()) {
//             throw new Error('Quiz not found');
//         }
//         const quizData = snapshot.val();
//         const questions = quizData.questions || [];
//         const updatedQuestions = questions.filter(id => id !== questionId);
//         await update(quizRef, { questions: updatedQuestions });
//     } catch (error) {
//         console.error('Error removing question from quiz:', error);
//         throw new Error('Failed to remove question from quiz');
//     }
// };

export const joinOrganization = async (orgId, userId) => {
    try {
        const userRef = dbRef(db, `users/${userId}`);
        await update(userRef, { organizationId: orgId });
    } catch (error) {
        console.error('Error joining organization:', error);
        throw new Error('Failed to join organization');
    }
};

export const leaveOrganization = async (orgId, userId) => {
    try {
        const userRef = dbRef(db, `users/${userId}`);
        await update(userRef, { organizationId: null });
    } catch (error) {
        console.error('Error leaving organization:', error);
        throw new Error('Failed to leave organization');
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
