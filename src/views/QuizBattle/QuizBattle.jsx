import { useState, useContext, useEffect } from 'react';
import { Box, Text, Flex, Image, useColorModeValue, VStack } from '@chakra-ui/react';
import Swal from 'sweetalert2';
import { AppContext } from '../../state/app.context';
import { getRandomQuestion } from '../../services/question.service';
import PlayQuestionModal from '../../components/PlayQuestionModal/PlayQuestionModal';

const QuizBattle = () => {
    const { userData } = useContext(AppContext);
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [field, setField] = useState([[1, 0, 0], [0, 0, 0], [0, 0, 2]]);
    const [score, setScore] = useState({ player1: 0, player2: 0 });
    const [playerPositions, setPlayerPositions] = useState({ player1: [0, 0], player2: [2, 2] });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalQuestion, setModalQuestion] = useState(null);
    const [modalForBothPlayers, setModalForBothPlayers] = useState(false);
    const [currentBattleRow, setCurrentBattleRow] = useState(null);
    const [currentBattleCol, setCurrentBattleCol] = useState(null);

    const hexagonSize = '200px';
    const playerColors = [null, 'yellow.400', 'red.400'];
    const playerAvatars = ['path/to/player1/avatar.png', 'path/to/player2/avatar.png'];

    const isValidMove = (row, col, player) => {
        const numRows = field.length;
        const numCols = field[0].length;

        if (row < 0 || row >= numRows || col < 0 || col >= numCols) return false;

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols && field[newRow][newCol] === player) {
                return true;
            }
        }
        return false;
    };

    const handleFieldClick = async (row, col) => {
        if (!isValidMove(row, col, currentPlayer)) {
            Swal.fire('Invalid Move', 'You can only select adjacent hexagons.', 'error');
            return;
        }

        const currentField = field[row][col];
        if (currentField === 0) {
            const outcome = await askQuestionToSingleUser();
            if (outcome) {
                updateField(row, col, currentPlayer, 1);
            }
        } else if (currentField === 3 - currentPlayer) {
            setCurrentBattleRow(row);
            setCurrentBattleCol(col);
            const outcome = await handleBattle(row, col);
            if (outcome) {
                updateField(row, col, currentPlayer, 1);
            }
        } else {
            Swal.fire('Invalid Move', 'The selected position is already occupied by you.', 'error');
        }

        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    };

    const updateField = (row, col, player, points) => {
        const updatedField = field.map((r, idx) => idx === row ? [...r] : r);
        updatedField[row][col] = player;

        setField(updatedField);
        setPlayerPositions(prevPositions => ({
            ...prevPositions,
            [`player${player}`]: [row, col]
        }));

        setScore(prevScore => ({
            ...prevScore,
            [`player${player}`]: prevScore[`player${player}`] + points
        }));
    };

    const handleBattle = async (row, col) => {
        const question = await getRandomQuestion();
        setModalQuestion(question);
        setModalForBothPlayers(true);
        setIsModalOpen(true);
    };

    const askQuestionToSingleUser = async () => {
        const question = await getRandomQuestion();
        setModalQuestion(question);
        setModalForBothPlayers(false);
        return true;
    };

    const handleModalSubmit = (questionId, answer) => {
        setIsModalOpen(false);

        if (modalForBothPlayers) {
            const winner = answer === modalQuestion.correctAnswer ? currentPlayer : 3 - currentPlayer;
            Swal.fire(`Player ${winner} won the battle!`);
            updateField(currentBattleRow, currentBattleCol, winner, 2);
        }
    };

    useEffect(() => {
        const totalMoves = field.flat().filter(f => f !== 0).length;
        if (totalMoves === 9) {
            const winner = score.player1 > score.player2 ? 'Player 1' : 'Player 2';
            Swal.fire(`Game Over! ${winner} wins!`);
        }
    }, [field, score]);

    return (
        <Box p={6}>
            <Text fontSize="xl" fontWeight="bold">Quiz Battle</Text>
            <Flex mb={4} justify="space-between">
                <VStack spacing={4} align="center" w="48%">
                    <Box
                        p={4}
                        bg={useColorModeValue('yellow.100', 'yellow.700')}
                        borderRadius="md"
                        boxShadow="md"
                        textAlign="center"
                    >
                        <Image
                            src={playerAvatars[1]}
                            alt="Player 1"
                            borderRadius="full"
                            boxSize="100px"
                            mb={2}
                            mx="auto"
                        />
                        <Text fontSize="lg" fontWeight="bold">Player 1</Text>
                        <Text>Score: {score.player1}</Text>
                        <Text color="yellow.600">Top-left Corner</Text>
                    </Box>
                </VStack>
                <VStack spacing={4} align="center" w="48%">
                    <Box
                        p={4}
                        bg={useColorModeValue('red.100', 'red.700')}
                        borderRadius="md"
                        boxShadow="md"
                        textAlign="center"
                    >
                        <Image
                            src={playerAvatars[2]}
                            alt="Player 2"
                            borderRadius="full"
                            boxSize="100px"
                            mb={2}
                            mx="auto"
                        />
                        <Text fontSize="lg" fontWeight="bold">Player 2</Text>
                        <Text>Score: {score.player2}</Text>
                        <Text color="red.600">Bottom-right Corner</Text>
                    </Box>
                </VStack>
            </Flex>
            <Flex justify="center" align="center" direction="column">
                {field.map((row, rowIndex) => (
                    <Flex key={rowIndex} mb={-3} justify="center">
                        {row.map((cell, colIndex) => (
                            <Flex
                                key={`${rowIndex}-${colIndex}`}
                                justify="center"
                                align="center"
                                h={hexagonSize}
                                w={hexagonSize}
                                bg={cell === 0 ? 'gray.200' : playerColors[cell]}
                                borderColor={rowIndex === playerPositions[`player${currentPlayer}`][0] && colIndex === playerPositions[`player${currentPlayer}`][1] ? 'blue.500' : 'transparent'}
                                borderWidth={rowIndex === playerPositions[`player${currentPlayer}`][0] && colIndex === playerPositions[`player${currentPlayer}`][1] ? '2px' : '0'}
                                clipPath="polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)"
                                m={1}
                                cursor="pointer"
                                onClick={() => handleFieldClick(rowIndex, colIndex)}
                            >
                                <Text fontSize="2xl" fontWeight="bold" color={cell === 0 ? 'black' : 'white'}>
                                    {cell === 0 ? '' : cell === 1 ? 'P1' : 'P2'}
                                </Text>
                            </Flex>
                        ))}
                    </Flex>
                ))}
            </Flex>

            {isModalOpen && (
                <PlayQuestionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    question={modalQuestion}
                    onAnswerSubmit={handleModalSubmit}
                    isForBothPlayers={modalForBothPlayers}
                />
            )}
        </Box>
    );
};

export default QuizBattle;
