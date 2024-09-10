import { useState, useContext, useEffect } from 'react';
import { Box, Text, Flex, VStack, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/app.context';
import { getRandomQuestion } from '../../services/question.service';
import { getBattle, updateStatus, switchPlayer, updateField, updateQuestion, updatePoints, updateMoves, deleteBattle } from '../../services/quiz-battle.service';
import PlayQuestionModal from '../../components/PlayQuestionModal/PlayQuestionModal';
import { useParams } from 'react-router-dom';
import StatusAvatar from '../../components/StatusAvatar/StatusAvatar';
import { getUserByUsername, getUserPoints, updateUser } from '../../services/user.service';
import { QUESTION_TIME_LIMIT } from '../../common/components.constants';

const QuizBattle = () => {
    const { userData } = useContext(AppContext);
    const { battleId } = useParams();
    const navigate = useNavigate();
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [players, setPlayers] = useState({ 1: 'player1', 2: 'player2' });
    const [activeUser, setActiveUser] = useState('');
    const [quizField, setQuizField] = useState([[1, 0, 0], [0, 0, 0], [0, 0, 2]]);
    const [score, setScore] = useState({ player1: 0, player2: 0 });
    const [playersReady, setPlayersReady] = useState({ player1: false, player2: false });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalQuestion, setModalQuestion] = useState(null);
    const [currentBattleCol, setCurrentBattleCol] = useState(null);
    const [currentBattleRow, setCurrentBattleRow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessingMove, setIsProcessingMove] = useState(false);
    const [playerNumber, setPlayerNumber] = useState(1);
    const [userDetails, setUserDetails] = useState([]);
    const [moves, setMoves] = useState(18);
    const [gameOver, setGameOver] = useState(false);
    const [cellColors, setCellColors] = useState(quizField.map(row => row.map(cell => null)));

    const playerColors = ['gray.100', 'yellow.400', 'red.400', 'yellow.400', 'red.400'];
    const hexagonSize = '220px';
    const hexagonShape = {
        clipPath: 'polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)'
    };

    useEffect(() => {
        initBattle();
    }, [userData, battleId]);

    useEffect(() => {
        checkGameOver();
    }, [moves]);

    useEffect(() => {
        const intervalId = setInterval(toggleColors, 600);

        return () => clearInterval(intervalId);
    }, [quizField]);

    const initBattle = async () => {
        await updateStatus(battleId, userData.username, true);

        getBattle(battleId, (battleData) => {
            if (battleData) {
                setQuizField(battleData.field);
                setScore({
                    player1: battleData.player1.points,
                    player2: battleData.player2.points,
                });
                setPlayersReady({
                    player1: battleData.player1.isReady,
                    player2: battleData.player2.isReady,
                });
                setPlayers({
                    1: battleData.player1.username,
                    2: battleData.player2.username,
                });
                setActiveUser(battleData.activeUser);
                setCurrentPlayer(battleData.player1.username === battleData.activeUser ? 1 : 2);
                setPlayerNumber(battleData.player1.username === userData.username ? 1 : 2);
                setMoves(battleData.moves);

                loadUsers([battleData.player1.username, battleData.player2.username]);

                setLoading(false);
            }
        });
    };

    const handleFieldClick = async (row, col) => {
        if (isProcessingMove || gameOver) return;

        if (userData.username !== activeUser) {
            Swal.fire('Not Your Turn', 'Please wait for your opponent to make their move.', 'info');
            return;
        }
        if (!isValidMove(row, col, currentPlayer)) {
            Swal.fire('Invalid Move', 'You can only select adjacent hexagons that are occupied by you.', 'error');
            return;
        }

        setIsProcessingMove(true);
        const currentField = quizField[row][col];
        setCurrentBattleRow(row);
        setCurrentBattleCol(col);

        if (currentField === 0 || currentField === 3 - currentPlayer) {
            const newValue = currentPlayer === 1 ? currentField + 10 : currentField + 20;
            await updateQuizField(row, col, newValue);
            await askQuestionToSingleUser();
        } else {
            Swal.fire('Invalid Move', 'The selected position is already occupied by you.', 'error');
        }
        setIsProcessingMove(false);
    };

    const askQuestionToSingleUser = async () => {
        const question = await getRandomQuestion();
        await updateQuestion(battleId, question);
        setModalQuestion(question);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (questionId, userAnswer) => {
        const correctAnswer = modalQuestion.answer;
        const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

        if (isCorrect) {
            const updatedScore = { ...score };
            updatedScore[`player${playerNumber}`] += 1;
            setScore(updatedScore);

            await updatePoints(battleId, userData.username, updatedScore[`player${playerNumber}`]);
            if (currentBattleRow !== null && currentBattleCol !== null) {
                await updateQuizField(currentBattleRow, currentBattleCol, currentPlayer);
            }
            Swal.fire('Correct!', 'You have earned 1 point!', 'success');
        } else {
            const cellValue = quizField[currentBattleRow][currentBattleCol];
            const updatedValue = playerNumber === 1 ? cellValue - 10 : cellValue - 20;
            await updateQuizField(currentBattleRow, currentBattleCol, updatedValue);
            Swal.fire('Incorrect!', 'Better luck next time.', 'error');
        }

        setIsModalOpen(false);

        const newMoves = moves - 1;
        setMoves(newMoves);
        await updateMoves(battleId, newMoves);

        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        await switchPlayer(battleId, players[currentPlayer === 1 ? 2 : 1]);
    };

    const updateQuizField = async (row, col, player) => {
        const newField = [...quizField];
        newField[row][col] = player;
        setQuizField(newField);
        await updateField(battleId, newField);
    };

    const isValidMove = (row, col, player) => {
        const numRows = quizField.length;
        const numCols = quizField[0].length;

        if (quizField[row][col] === player) return false;

        if (row < 0 || row >= numRows || col < 0 || col >= numCols) return false;

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols && quizField[newRow][newCol] === player) {
                return true;
            }
        }
        return false;
    };

    const loadUsers = async (players) => {
        const usersWithDetails = await Promise.all(
            players.map(async (username) => {
                const userInfo = await getUserByUsername(username);
                return {
                    username,
                    uid: userInfo?.uid || 'unknown',
                    avatar: userInfo?.avatar || userInfo?.avatarUrl || '',
                    onlineStatus: userInfo?.onlineStatus || 'offline',
                };
            })
        );
        setUserDetails(usersWithDetails);
    };

    const checkGameOver = () => {
        const player1HasBoxes = quizField.flat().some(cell => cell === 1);
        const player2HasBoxes = quizField.flat().some(cell => cell === 2);

        if (moves <= 0 || !player1HasBoxes || !player2HasBoxes) {
            endGame();
        }
    };

    const endGame = async () => {
        setGameOver(true);
        const totalPoints = 100;

        const player1Percentage = (score.player1 / (score.player1 + score.player2)) * 100;
        const player1FinalScore = Math.round(totalPoints * (player1Percentage / 100));
        const player2FinalScore = totalPoints - player1FinalScore;

        let result = 'Undetermined';
        if (player1FinalScore === player2FinalScore) {
            result = 'Draw';
        } else if (player1FinalScore > player2FinalScore) {
            result = playerNumber === 1 ? 'You Win!!!' : 'You Lost';
        } else if (player2FinalScore > player1FinalScore) {
            result = playerNumber === 2 ? 'You Win!!!' : 'You Lost';
        }

        await Swal.fire({
            title: `${result}`,
            text: `Final Scores:\nPlayer 1: ${player1FinalScore}\nPlayer 2: ${player2FinalScore}`,
            icon: 'info',
            confirmButtonText: 'OK'
        });
        const userFinalScore = playerNumber === 1 ? player1FinalScore : player2FinalScore;

        const userPoints = await getUserPoints(userData.username);
        const updatedUser = { ...userData, points: userPoints + userFinalScore };
        await updateUser(userData.uid, updatedUser);

        await updateStatus(battleId, userData.username, false);
        if (!playersReady.player1 && !playersReady.player2) {
            await deleteBattle(battleId);
        }
        navigate('/quiz-battle-lobby');
    };

    const toggleColors = () => {
        setCellColors(prevColors =>
            prevColors.map((row, rowIndex) =>
                row.map((cellColor, colIndex) => {
                    const cellValue = quizField[rowIndex][colIndex];
                    if (cellValue === 10) {
                        return cellColor === 'yellow.400' ? 'gray.100' : 'yellow.400';
                    } else if (cellValue === 12) {
                        return cellColor === 'red.400' ? 'yellow.400' : 'red.400';
                    } else if (cellValue === 20) {
                        return cellColor === 'gray.100' ? 'red.400' : 'gray.100';
                    } else if (cellValue === 21) {
                        return cellColor === 'yellow.400' ? 'red.400' : 'yellow.400';
                    }
                    return null;
                })
            )
        );
    };

    return (
        <Box p={6} marginTop="20" minH="100vh">

            <Text fontSize="4xl" fontWeight="bold" textAlign="center" mb={6} color="teal.500">Quiz Battle</Text>

            <Box
                mb={6}
                p={4}
                textAlign="center"
                bg={currentPlayer === 1 ? 'yellow.200' : 'red.200'}
                color={currentPlayer === 1 ? 'yellow.800' : 'red.800'}
                borderRadius="lg"
                fontWeight="bold"
                fontSize="lg"
            >
                {activeUser === userData?.username ? 'Your Turn' : `${players[currentPlayer === 1 ? 1 : 2]}'s Turn`}
            </Box>
            <Text
                fontSize="l"
                fontWeight="bold"
                color="yellow.500"
                textAlign="center"
                marginBottom="10"
            >
                {moves} turns left
            </Text>
            {loading ? (
                <Flex justify="center" align="center" height="50vh">
                    <Spinner size="lg" />
                </Flex>
            ) : (
                <Flex justify="space-between" align="center">

                    <VStack spacing={4} align="center" w="20%" marginRight="20">
                        <Box
                            p={6}
                            bg="yellow.100"
                            borderRadius="lg"
                            boxShadow="xl"
                            textAlign="center"
                            border="2px solid yellow.400"
                            w="100%"
                        >
                            <StatusAvatar uid={userDetails[0]?.uid} src={userDetails[0]?.avatar || ''} size="lg" />
                            <Text fontSize="lg" fontWeight="bold" color="teal.500">{players[1] === userData.username ? 'You' : players[1]}</Text>
                            <Text fontSize="lg">Score: {score.player1}</Text>
                        </Box>
                    </VStack>
                    {
                        !playersReady.player1 || !playersReady.player2 ? (
                            <Alert status="info" mt={4}>
                                <AlertIcon />
                                Please wait for the other player...
                            </Alert>
                        ) : (
                            <Flex direction="column" justify="center" align="center" w="60%">
                                {quizField.map((row, rowIndex) => (
                                    <Flex key={rowIndex} justify="center" mt={-5}>
                                        {row.map((cell, colIndex) => (
                                            <Box
                                                key={`${rowIndex}-${colIndex}`}
                                                bg={cellColors[rowIndex][colIndex] || playerColors[cell] || 'gray.100'}
                                                w={hexagonSize}
                                                h={hexagonSize}
                                                m={3}
                                                display="flex"
                                                justifyContent="center"
                                                alignItems="center"
                                                {...hexagonShape}
                                                cursor="pointer"
                                                border={isValidMove(rowIndex, colIndex, playerNumber) ? '2px solid green' : '2px solid red'}
                                                _hover={{
                                                    bg: playerNumber === currentPlayer
                                                        ? (isValidMove(rowIndex, colIndex, playerNumber) ? 'green.200' : 'red.200')
                                                        : null,
                                                    transform: playerNumber === currentPlayer && isValidMove(rowIndex, colIndex, playerNumber) ? 'scale(1.1)' : 'scale(1.01)',
                                                }}
                                                onClick={() => handleFieldClick(rowIndex, colIndex)}
                                            >
                                                <Text fontSize="2xl" fontWeight="bold" color={cell === 0 ? 'black' : 'white'}>
                                                    {cell === 0 ? '' : cell === 1 || cell === 10  ? 'P1' : 'P2'}
                                                </Text>
                                            </Box>
                                        ))}
                                    </Flex>
                                ))}
                            </Flex>
                        )
                    }

                    <VStack VStack spacing={4} align="center" w="20%" marginLeft="20">
                        <Box
                            p={6}
                            bg="red.100"
                            borderRadius="lg"
                            boxShadow="xl"
                            textAlign="center"
                            border="2px solid red.400"
                            w="100%"
                        >
                            <StatusAvatar uid={userDetails[1]?.uid} src={userDetails[1]?.avatar || ''} size="lg" />
                            <Text fontSize="lg" fontWeight="bold" color="teal.500">{players[2] === userData.username ? 'You' : players[2]}</Text>
                            <Text fontSize="lg">Score: {score.player2}</Text>
                        </Box>
                    </VStack>
                </Flex>
            )
            }

            {
                isModalOpen && (
                    <PlayQuestionModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        question={modalQuestion}
                        onAnswerSubmit={handleModalSubmit}
                        timeLimit={QUESTION_TIME_LIMIT}
                    />
                )
            }
        </Box >
    );
};

export default QuizBattle;
