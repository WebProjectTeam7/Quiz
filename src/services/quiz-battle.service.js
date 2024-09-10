import { db } from '../config/firebase-config';
import { ref, set, get, onValue, update, remove, push } from 'firebase/database';

// CREATE

export const createBattle = async (usernamePlayer1, usernamePlayer2, field, moves) => {
    try {
        const battleRef = push(ref(db, 'battles'));
        const battleId = battleRef.key;
        await set(battleRef, {
            id: battleId,
            player1: {
                username: usernamePlayer1,
                isReady: true,
                answer: null,
                points: 0,
            },
            player2: {
                username: usernamePlayer2,
                isReady: false,
                answer: null,
                points: 0,
            },
            field,
            moves,
            activeUser: usernamePlayer1,
            currentQuestion: null,
        });
        return battleId;
    } catch (error) {
        console.error('Error creating battle:', error);
        throw new Error('Failed to create battle');
    }
};

// RETRIEVE

export const getBattle = async (battleId, onBattleUpdate) => {
    try {
        const battleRef = ref(db, 'battles/' + battleId);
        onValue(battleRef, (snapshot) => {
            if (snapshot.exists()) {
                const battleData = snapshot.val();
                onBattleUpdate(battleData);
            } else {
                console.error('No data available for battle:', battleId);
            }
        });
    } catch (error) {
        console.error('Error retrieving battle:', error);
        throw new Error('Failed to retrieve battle');
    }
};

// UPDATE

export const switchPlayer = async (battleId, username) => {
    try {
        const battleRef = ref(db, 'battles/' + battleId);
        await update(battleRef, {
            activeUser: username
        });
    } catch (error) {
        console.error('Error switching player:', error);
        throw new Error('Failed to switch player');
    }
};

export const addPointsToPlayer = async (battleId, username, points) => {
    try {
        const battleRef = ref(db, 'battles/' + battleId);
        const snapshot = await get(battleRef);

        if (snapshot.exists()) {
            const battleData = snapshot.val();
            const playerKey = battleData.player1.username === username ? 'player1' : 'player2';
            const newPoints = battleData[playerKey].points + points;

            await update(battleRef, {
                [`${playerKey}/points`]: newPoints
            });
        }
    } catch (error) {
        console.error('Error adding points to player:', error);
        throw new Error('Failed to add points to player');
    }
};

export const updateField = async (battleId, field) => {
    try {
        const battleRef = ref(db, 'battles/' + battleId);
        await update(battleRef, {
            field
        });
    } catch (error) {
        console.error('Error updating battlefield:', error);
        throw new Error('Failed to update battlefield');
    }
};

export const updateQuestion = async (battleId, question) => {
    try {
        const battleRef = ref(db, 'battles/' + battleId);
        await update(battleRef, {
            currentQuestion: question,
        });
    } catch (error) {
        console.error('Error updating current question:', error);
        throw new Error('Failed to update current question');
    }
};


export const updateMoves = async (battleId, moves) => {
    try {
        const battleRef = ref(db, 'battles/' + battleId);
        await update(battleRef, {
            moves,
        });
    } catch (error) {
        console.error('Error updating current question:', error);
        throw new Error('Failed to update current question');
    }
};

export const updateStatus = async (battleId, username, status) => {
    try {
        const battleRef = ref(db, `battles/${battleId}`);
        const snapshot = await get(battleRef);

        if (snapshot.exists()) {
            const battleData = snapshot.val();
            const playerKey = battleData.player1.username === username ? 'player1' : 'player2';

            await update(battleRef, {
                [`${playerKey}/isReady`]: status
            });
        }
    } catch (error) {
        console.error('Error updating status:', error);
        throw new Error('Failed to update status');
    }
};

export const updatePoints = async (battleId, username, points) => {
    try {
        const battleRef = ref(db, `battles/${battleId}`);
        const snapshot = await get(battleRef);

        if (snapshot.exists()) {
            const battleData = snapshot.val();
            const playerKey = battleData.player1.username === username ? 'player1' : 'player2';

            await update(battleRef, {
                [`${playerKey}/points`]: points,
            });
        }
    } catch (error) {
        console.error('Error updating points:', error);
        throw new Error('Failed to update points');
    }
};


export const updateAnswer = async (battleId, username, answer) => {
    try {
        const battleRef = ref(db, `battles/${battleId}`);
        const snapshot = await get(battleRef);

        if (snapshot.exists()) {
            const battleData = snapshot.val();
            const playerKey = battleData.player1.username === username ? 'player1' : 'player2';
            const timestamp = Date.now();

            await update(battleRef, {
                [`${playerKey}/answer`]: answer,
                [`${playerKey}/answerTimestamp`]: timestamp
            });
        }
    } catch (error) {
        console.error('Error updating answer:', error);
        throw new Error('Failed to update answer');
    }
};

export const cleanupCurrentQuestion = async (battleId) => {
    try {
        const battleRef = ref(db, `battles/${battleId}`);
        const snapshot = await get(battleRef);

        if (snapshot.exists()) {
            const updates = {
                currentQuestion: null,
                'player1/answer': null,
                'player1/answerTimestamp': null,
                'player2/answer': null,
                'player2/answerTimestamp': null
            };
            await update(battleRef, updates);
        }
    } catch (error) {
        console.error('Error cleaning up current question:', error);
        throw new Error('Failed to clean up current question');
    }
};

// DELETE

export const deleteBattle = async (battleId) => {
    try {
        const battleRef = ref(db, 'battles/' + battleId);
        await remove(battleRef);
    } catch (error) {
        console.error('Error deleting battle:', error);
        throw new Error('Failed to delete battle');
    }
};
