import { ref as dbRef, push, get, update, set, remove, query, orderByChild, equalTo } from 'firebase/database';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase-config';
import { ONE_WEEK_IN_MS } from '../common/components.constants';

// CREATE

export const createQuiz = async (quiz) => {
    try {
        const quizRef = push(dbRef(db, 'quizzes'));
        const quizId = quizRef.key;
        const newQuiz = {
            ...quiz,
            id: quizId,
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
        let categoryQuizzesQuery;

        if (categoryName === 'all') {
            categoryQuizzesQuery = query(dbRef(db, 'quizzes'));
        } else {
            const quizRef = dbRef(db, 'quizzes');
            categoryQuizzesQuery = query(quizRef, orderByChild('category'), equalTo(categoryName));
        }

        const snapshot = await get(categoryQuizzesQuery);

        if (snapshot.exists()) {
            const categoryQuizzes = [];
            snapshot.forEach((childSnapshot) => {
                const quizData = childSnapshot.val();
                if (quizData.isActive) {
                    categoryQuizzes.push({ id: childSnapshot.key, ...quizData });
                }
            });
            return categoryQuizzes;
        }

        return [];
    } catch (error) {
        console.error('Error retrieving quizzes by category:', error);
        throw new Error('Failed to retrieve quizzes by category');
    }
};

export const getQuizSummariesByCategory = async (category) => {
    try {
        const quizRef = dbRef(db, 'quizzes');
        const snapshot = await get(quizRef);

        const quizzes = snapshot.val();
        if (!quizzes) return [];

        const userPointsMap = {};
        const targetCategory = category.toLowerCase();

        Object.keys(quizzes).forEach((quizId) => {
            const quiz = quizzes[quizId];

            if (quiz.category && quiz.category.toLowerCase() === targetCategory) {
                if (quiz.summaries) {
                    Object.keys(quiz.summaries).forEach((username) => {
                        const userSummaries = quiz.summaries[username];

                        Object.keys(userSummaries).forEach((attempt) => {
                            const summary = userSummaries[attempt];
                            const userPoints = summary.points;

                            if (typeof userPoints === 'number') {
                                userPointsMap[username] = (userPointsMap[username] || 0) + userPoints;
                            }
                        });
                    });
                }
            }
        });

        const rankingData = Object.keys(userPointsMap).map((username) => ({
            username,
            points: userPointsMap[username],
        }));

        return rankingData;
    } catch (error) {
        console.error('Error retrieving quiz summaries by category:', error);
        throw new Error('Failed to retrieve quiz summaries by category');
    }
};

export const getAllQuizzes = async () => {
    try {
        const quizRef = dbRef(db, 'quizzes');
        const snapshot = await get(quizRef);
        if (snapshot.exists()) {
            const quizzes = snapshot.val();
            return Object.keys(quizzes).map((key) => ({
                id: key,
                ...quizzes[key],
            }));
        }
        return [];
    } catch (error) {
        console.error('Error retrieving all quizzes:', error);
        throw new Error('Failed to retrieve all quizzes');
    }
};

export const getQuizById = async (quizId) => {
    try {
        const quizRef = dbRef(db, `quizzes/${quizId}`);
        const snapshot = await get(quizRef);
        if (!snapshot.exists()) {
            return null;
        }
        const quizData = snapshot.val();
        return { id: quizId, ...quizData };
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

export const getPrivateQuizzes = async (username) => {
    try {
        const quizzesRef = dbRef(db, 'quizzes');
        const snapshot = await get(quizzesRef);

        if (!snapshot.exists()) {
            return [];
        }
        const allQuizzes = snapshot.val();

        const privateQuizzes = Object.keys(allQuizzes).map((quizId) => {
            const quiz = allQuizzes[quizId];
            if (
                quiz.type === 'private' &&
                quiz.isActive === true &&
                quiz.invitedUsers &&
                quiz.invitedUsers.includes(username)
            ) {
                return {
                    id: quizId,
                    ...quiz,
                };
            }
            return null;
        }).filter(quiz => quiz !== null);

        return privateQuizzes;
    } catch (error) {
        console.error('Error fetching private quizzes:', error);
        throw new Error('Failed to retrieve private quizzes');
    }
};

export const getInvitedUsers = async (quizId) => {
    try {
        const quizRef = dbRef(db, `quizzes/${quizId}`);
        const snapshot = await get(quizRef);

        if (!snapshot.exists()) {
            throw new Error('Quiz not found');
        }

        const quizData = snapshot.val();
        return quizData.invitedUsers || [];
    } catch (error) {
        console.error('Error fetching invited users:', error);
        throw new Error('Failed to fetch invited users');
    }
};

export const getRandomActiveQuiz = async () => {
    try {
        const quizRef = dbRef(db, 'quizzes');
        const activeQuizzesQuery = query(quizRef, orderByChild('isActive'), equalTo(true));
        const snapshot = await get(activeQuizzesQuery);

        if (snapshot.exists()) {
            const activeQuizzes = [];
            snapshot.forEach((childSnapshot) => {
                activeQuizzes.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });

            const randomIndex = Math.floor(Math.random() * activeQuizzes.length);
            return activeQuizzes[randomIndex];
        }
        return null;
    } catch (error) {
        console.error('Error retrieving random active quiz:', error);
        throw new Error('Failed to retrieve random active quiz');
    }
};

export const getQuizOfTheWeek = async () => {
    try {
        const quizOfWeekRef = dbRef(db, 'quizOfTheWeek');
        const snapshot = await get(quizOfWeekRef);
        const currentTime = Date.now();

        if (snapshot.exists()) {
            const data = snapshot.val();
            const selectedAt = new Date(data.selectedAt).getTime();
            if (currentTime - selectedAt < ONE_WEEK_IN_MS) {
                return data.quiz;
            }
        }

        const newQuiz = await getRandomActiveQuiz();
        const newQuizData = {
            quiz: newQuiz,
            selectedAt: new Date().toISOString(),
        };

        await set(quizOfWeekRef, newQuizData);

        return newQuiz;
    } catch (error) {
        console.error('Error getting quiz of the week:', error);
        throw new Error('Failed to retrieve or set quiz of the week');
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

export const saveQuizSummary = async (quizId, username, summary) => {
    try {
        const quizSummaryRef = dbRef(db, `quizzes/${quizId}/summaries/${username}`);

        const snapshot = await get(quizSummaryRef);
        let userSummaries = [];
        if (snapshot.exists()) {
            userSummaries = snapshot.val();
        }

        userSummaries.push({
            points: summary.points,
            createdAt: new Date().toISOString(),
            questions: summary.questions,
        });
        await set(quizSummaryRef, userSummaries);
    } catch (error) {
        console.error('Error saving quiz summary:', error);
        throw new Error('Failed to save quiz summary');
    }
};

export const inviteUserToPrivateQuiz = async (quizId, username) => {
    try {
        const quizRef = dbRef(db, `quizzes/${quizId}`);

        const snapshot = await get(quizRef);
        if (!snapshot.exists()) {
            throw new Error('Quiz not found');
        }
        const quizData = snapshot.val();
        let invitedUsers = quizData.invitedUsers || [];

        if (invitedUsers.includes(username)) {
            // throw new Error(`User ${username} is already invited to the quiz.`);
            return;
        }

        invitedUsers.push(username);
        await update(quizRef, { invitedUsers });
    } catch (error) {
        console.error('Error inviting user to quiz:', error);
        throw new Error('Failed to invite user to quiz');
    }
};

export const uninviteUserFromPrivateQuiz = async (quizId, username) => {
    try {
        const quizRef = dbRef(db, `quizzes/${quizId}`);

        const snapshot = await get(quizRef);
        if (!snapshot.exists()) {
            throw new Error('Quiz not found');
        }
        const quizData = snapshot.val();
        let invitedUsers = quizData.invitedUsers || [];

        if (!invitedUsers.includes(username)) {
            throw new Error(`User ${username} is not invited to the quiz.`);
        }
        invitedUsers = invitedUsers.filter(user => user !== username);
        await update(quizRef, { invitedUsers });
    } catch (error) {
        console.error('Error uninviting user from quiz:', error);
        throw new Error('Failed to uninvite user from quiz');
    }
};

export const checkIfQuizCompleted = async (quizId, username) => {
    try {
        const summaryRef = dbRef(db, `quizzes/${quizId}/summaries/${username}`);
        const snapshot = await get(summaryRef);

        if (snapshot.exists()) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking quiz completion:', error);
        throw new Error('Failed to check quiz completion');
    }
};

export const fetchQuizSummary = async (quizId, username) => {
    try {
        const summaryRef = dbRef(db, `quizzes/${quizId}/summaries/${username}`);
        const snapshot = await get(summaryRef);
        if (snapshot.exists()) {
            const summaries = snapshot.val();
            return summaries.length > 0 ? summaries[0] : null;
        }
        return null;
    } catch (error) {
        console.error('Error fetching quiz summary:', error);
        throw new Error('Failed to fetch quiz summary');
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
