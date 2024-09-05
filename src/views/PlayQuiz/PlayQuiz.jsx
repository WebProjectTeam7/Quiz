import {
    Box,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Divider,
    Spinner,
} from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/app.context';
import { getQuizById, saveQuizSummary } from '../../services/quiz.service';
import { getQuestionById } from '../../services/question.service';
import Swal from 'sweetalert2';
import QuestionView from '../../components/QuestionView/QuestionView';
import UserRoleEnum from '../../common/role-enum';
import { updateUser } from '../../services/user.service';

export default function PlayQuiz() {
    const { userData } = useContext(AppContext);
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timer, setTimer] = useState(null);
    const [answers, setAnswers] = useState({});
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

    useEffect(() => {
        const storedAnswers = JSON.parse(localStorage.getItem(`quiz-${quizId}-answers`)) || {};
        setAnswers(storedAnswers);
        fetchQuizData();

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [quizId]);

    useEffect(() => {
        if (timeLeft <= 0 && !isLoading) {
            handleSubmitQuiz(true);
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prevTime) => {
                const newTime = prevTime - 1;
                localStorage.setItem(`quiz-${quizId}-timeLeft`, newTime);
                return newTime;
            });
        }, 1000);

        setTimer(interval);

        return () => { clearInterval(interval); };
    }, [timeLeft, isLoading, quizId]);

    const fetchQuizData = async () => {
        try {
            const fetchedQuiz = await getQuizById(quizId);
            setQuiz(fetchedQuiz);

            if (fetchedQuiz.questions && fetchedQuiz.questions.length > 0) {
                let fetchedQuestions = await Promise.all(
                    fetchedQuiz.questions.map(async (questionId) => await getQuestionById(questionId))
                );
                fetchedQuestions = fetchedQuestions.filter((q) => q !== null);
                setQuestions(fetchedQuestions);
            }

            const savedTimeLeft = localStorage.getItem(`quiz-${quizId}-timeLeft`);
            const initialTimeLeft = savedTimeLeft ? parseInt(savedTimeLeft, 10) : fetchedQuiz.timeLimit * 60;
            setTimeLeft(initialTimeLeft);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch quiz data:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to fetch quiz data. Please try again.',
                icon: 'error',
                timer: 3000,
                showConfirmButton: false,
            });
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
        }
    };

    const handleAnswerSubmit = (questionId, answer) => {
        const correctAnswer = questions[currentQuestionIndex].answer.toLowerCase();
        const userAnswer = answer.toLowerCase();
        const isCorrect = userAnswer === correctAnswer;

        setAnswers((prevAnswers) => {
            const updatedAnswers = {
                ...prevAnswers,
                [questionId]: { answer, isCorrect },
            };

            const count = Object.values(updatedAnswers).filter((a) => a.isCorrect).length;
            setCorrectAnswersCount(count);

            localStorage.setItem(`quiz-${quizId}-answers`, JSON.stringify(updatedAnswers));
            return updatedAnswers;
        });
    };

    const calculateScore = () => {
        if (quiz.totalPoints && questions.length > 0) {
            const totalPoints = quiz.totalPoints;
            const numQuestions = questions.length;
            const correctAnswers = correctAnswersCount;

            let score = (totalPoints / numQuestions) * correctAnswers;
            score = Math.ceil(score);

            if (score > totalPoints) {
                score = totalPoints;
            }

            return score;
        }
        return 0;
    };

    const handleSubmitQuiz = async (forceSubmit = false) => {
        if (!forceSubmit) {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'Do you want to submit your answers? You won’t be able to enter the quiz again.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, submit it!',
                cancelButtonText: 'No, keep playing',
            });

            if (!result.isConfirmed) {
                return;
            }
        }

        try {
            const finalScore = calculateScore();

            const summary = {
                username: userData.username,
                points: finalScore,
                date: new Date().toISOString(),
                questions: questions.map((q) => {
                    const userAnswer = answers[q.id]?.answer || 'No Answer';
                    const isCorrect = answers[q.id]?.isCorrect || false;
                    const imageUrl = q.imageFile ? URL.createObjectURL(q.imageFile) : q.imageUrl || '';
                    return {
                        questionText: q.title,
                        description: q.description || '',
                        imageUrl: imageUrl,
                        userAnswer,
                        correctAnswer: q.answer,
                        isCorrect,
                        options: q.options ? q.options : null,
                        isOpenEnded: q.options && q.options.length > 0 ? true : false,
                    };
                }),
            };

            await saveQuizSummary(quizId, userData.username, summary);

            const updatedUser = { ...userData, points: userData.points + finalScore };
            await updateUser(userData.uid, updatedUser);

            localStorage.removeItem(`quiz-${quizId}-timeLeft`);
            localStorage.removeItem(`quiz-${quizId}-answers`);

            navigate('/quiz-summary', { state: { summary } });
        } catch (error) {
            console.error('Error saving quiz summary:', error);
        }
    };

    const handleQuestionClick = (index) => {
        setCurrentQuestionIndex(index);
    };

    if (isLoading) {
        return <Spinner />;
    }


    return (
        <HStack>
            <Box maxW="800px" mx="auto" py={8}>
                <VStack spacing={4} align="start">
                    <Heading as="h2" size="lg">{quiz.title}</Heading>
                    <Text fontSize="md">by {quiz.author}</Text>
                    <Text fontSize="md">{quiz.description}</Text>
                    <Text fontSize="sm">Category: {quiz.category}</Text>
                    <Text fontSize="sm">Difficulty: {quiz.difficulty}</Text>
                    <Text fontSize="sm">Time Limit: {quiz.timeLimit} minutes</Text>
                    <Text fontSize="sm">Total points awarded: {quiz.totalPoints} points</Text>
                    {quiz.dataBegins && (
                        <Text fontSize="sm">Starts: {new Date(quiz.dataBegins).toLocaleString()}</Text>
                    )}
                    {quiz.dateEnds && (
                        <Text fontSize="sm">Ends: {new Date(quiz.dateEnds).toLocaleString()}</Text>
                    )}
                    <Divider />

                    <Text fontSize="lg" fontWeight="bold">
                        Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </Text>

                    <HStack align="start" spacing={8} width="100%">
                        <Box flex="3">
                            {questions.length > 0 && (
                                <QuestionView
                                    question={questions[currentQuestionIndex]}
                                    onAnswerSubmit={handleAnswerSubmit}
                                    savedAnswer={answers[questions[currentQuestionIndex].id]?.answer || ''}
                                />
                            )}
                            <HStack spacing={4} mt={4}>
                                <Button onClick={handlePreviousQuestion} isDisabled={currentQuestionIndex === 0}>
                                    Previous
                                </Button>
                                <Button onClick={handleNextQuestion} isDisabled={currentQuestionIndex === questions.length - 1}>
                                    Next
                                </Button>
                                <Button onClick={() => handleSubmitQuiz(false)} colorScheme="blue">
                                    Submit
                                </Button>
                            </HStack>
                        </Box>
                    </HStack>
                </VStack>
            </Box>
            <Box flex="1" borderLeft="1px solid" borderColor="gray.200" pl={4}>
                <Heading as="h4" size="md">Questions Status</Heading>
                <VStack align="start" spacing={2} mt={4}>
                    {questions.map((question, index) => (
                        <HStack
                            key={question.id}
                            justifyContent="space-between"
                            width="100%"
                            cursor="pointer"
                            p={2}
                            borderRadius="md"
                            onClick={() => handleQuestionClick(index)}
                        >
                            <Text>Question {index + 1}</Text>
                            <Text fontWeight="bold" color={answers[question.id]?.answer ? 'green.500' : 'red.500'}>
                                {answers[question.id]?.answer ? 'Answered' : 'Not Answered'}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            </Box>
        </HStack>
    );
}
