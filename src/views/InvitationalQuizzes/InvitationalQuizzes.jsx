import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../state/app.context';
import { getPrivateQuizzes } from '../../services/quiz.service';
import { Box, Flex, Text, Icon, Button, Spinner, Badge } from '@chakra-ui/react';
import { FaLock } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './InvitationalQuizzes.css';
import { useNavigate } from 'react-router-dom';

export default function InvitationalQuizzes() {
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userData && userData.username) {
            fetchPrivateQuizzes();
        }
    }, [userData]);

    const fetchPrivateQuizzes = async () => {
        try {
            const result = await getPrivateQuizzes(userData.username);
            setQuizzes(result);
        } catch (error) {
            console.error('Error fetching private quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const isQuizAccessible = (quiz) => {
        const currentDate = new Date();
        const { dateBegins, dateEnds } = quiz;

        if (dateBegins && dateEnds) {
            const beginDate = new Date(dateBegins);
            const endDate = new Date(dateEnds);
            return currentDate >= beginDate && currentDate <= endDate;
        } else if (dateBegins) {
            const beginDate = new Date(dateBegins);
            return currentDate >= beginDate;
        } else if (dateEnds) {
            const endDate = new Date(dateEnds);
            return currentDate <= endDate;
        }

        return true;
    };

    const isQuizDone = (quiz) => {
        if (quiz.summaries) {
            return quiz.summaries[userData.username];
        }
        return false;
    };

    const getQuizStatus = (quiz) => {
        const isDone = isQuizDone(quiz);
        const isAccessible = isQuizAccessible(quiz);

        if (isDone) {
            return 'Done';
        } else if (isAccessible) {
            return 'Available';
        } else {
            return 'Timeframe Not Open';
        }
    };

    const handleJoinQuiz = (quiz) => {
        const isInvited = quiz.invitedUsers.includes(userData.username);
        const isAccessible = isQuizAccessible(quiz);

        if (isInvited && isAccessible) {
            Swal.fire({
                title: 'Welcome!',
                text: `You have been invited to join the quiz: ${quiz.title}`,
                icon: 'success',
                confirmButtonText: 'Start Quiz',
                preConfirm: () => {
                    window.location.href = `/play-quiz/${quiz.id}`;
                }
            });
        } else if (!isAccessible) {
            Swal.fire({
                title: 'Quiz Not Available',
                text: 'This quiz is not currently open for participation.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        } else {
            Swal.fire({
                title: 'Access Denied',
                text: 'You do not have permission to join this quiz.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleViewSummary = (summary) => {
        navigate('/quiz-summary', { state: { summary } });
    };

    if (loading || !userData) {
        return (
            <Flex justifyContent="center" alignItems="center" minHeight="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    return (
        <Box padding="20px">
            <Text fontSize="2xl" fontWeight="bold" mb={6}>Invitational Quizzes</Text>
            <Flex direction="column" gap={4}>
                {quizzes.length > 0 ? (
                    quizzes.map((quiz) => {
                        const isDone = isQuizDone(quiz);
                        const isAccessible = isQuizAccessible(quiz);
                        const status = getQuizStatus(quiz);

                        return (
                            <Flex
                                key={quiz.id}
                                direction="column"
                                padding="15px"
                                borderRadius="md"
                                bg={isDone ? 'gray.200' : isAccessible ? 'green.100' : 'red.100'}
                                border="1px"
                                borderColor={isDone ? 'gray.400' : isAccessible ? 'green.300' : 'red.300'}
                                boxShadow="md"
                                position="relative"
                            >
                                <Badge
                                    position="absolute"
                                    top="-10px"
                                    right="50px"
                                    bg={isDone ? 'gray.600' : isAccessible ? 'green.500' : 'red.500'}
                                    color="white"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="md"
                                    border="2px solid"
                                    borderColor={isDone ? 'gray.800' : isAccessible ? 'green.700' : 'red.700'}
                                    boxShadow="lg"
                                >
                                    {status}
                                </Badge>

                                <Flex justifyContent="space-between" alignItems="center">
                                    <Text fontSize="xl" fontWeight="bold" color="black">
                                        {quiz.title}
                                    </Text>
                                    {!isAccessible ? (
                                        <Icon as={FaLock} color="red.500" boxSize={5} />
                                    ) : null}
                                </Flex>

                                <Text mt={2} color="black" fontStyle="italic">{quiz.description}</Text>

                                <Flex mt={4} justifyContent="space-between" wrap="wrap" gap={3}>
                                    <Badge colorScheme="purple">{quiz.category}</Badge>
                                    <Badge colorScheme="blue">Author: {quiz.author}</Badge>
                                    <Badge colorScheme="orange">Difficulty: {quiz.difficulty}</Badge>
                                    <Badge colorScheme="teal">Time Limit: {quiz.timeLimit} mins</Badge>
                                    <Badge colorScheme="yellow">Total Points: {quiz.totalPoints}</Badge>
                                </Flex>

                                <Text mt={2} fontSize="sm" color="gray.500">
                                    {quiz.dateBegins ? `Available from: ${new Date(quiz.dateBegins).toLocaleDateString()}` : ''}
                                    {quiz.dateEnds ? ` to ${new Date(quiz.dateEnds).toLocaleDateString()}` : ''}
                                </Text>

                                <Flex mt={4} justifyContent="flex-end">
                                    {isDone ?
                                        <Button colorScheme="gray" onClick={() => handleViewSummary(quiz.summaries[userData.username][0])}>
                                            View Summary
                                        </Button> :
                                        <Button
                                            colorScheme={!isDone && isAccessible ? 'green' : 'red'}
                                            onClick={() => handleJoinQuiz(quiz)}
                                            isDisabled={isDone || !isAccessible}
                                        >
                                            {!isDone && isAccessible ? 'Join Quiz' : 'Locked'}
                                        </Button>
                                    }
                                </Flex>
                            </Flex>
                        );
                    })
                ) : (
                    <Text>No private quizzes available at the moment.</Text>
                )}
            </Flex>
        </Box>
    );
}
