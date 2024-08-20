import {
    Box,
    Heading,
    Text,
    Button,
    Image,
    VStack,
    HStack,
    Divider,
    IconButton,
    Editable,
    EditableInput,
    EditablePreview,
    useDisclosure,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { EditIcon, DeleteIcon, ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import QuizAccessEnum from '../../common/access-enum';
import QuizCategoryEnum from '../../common/category-enum';
import QuizDifficultyEnum from '../../common/difficulty.enum';
import CreateQuestion from '../../components/CreateQuestion/CreateQuestion';
import QuestionPreview from '../../components/QuestionPreview/QuestionPreview';
import { addQuestionToQuiz, getQuizById, removeQuestionFromQuiz } from '../../services/quiz.service';
import { getQuestionById } from '../../services/question.service';

export default function QuizPreview() {
    const { quizId } = useParams();
    const [quiz, setQuiz] = useState({
        author: 'John Doe',
        type: QuizAccessEnum.PUBLIC,
        imageUrl: null,
        title: 'Sample Quiz',
        description: 'This is a sample quiz description.',
        timesTried: 0,
        scoreboard: [],
        category: QuizCategoryEnum.GENERAL,
        totalPoints: 100,
        difficulty: QuizDifficultyEnum.MEDIUM,
        dateBegins: null,
        dateEnds: null,
        timeLimit: null,
    });
    const [questions, setQuestions] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (quizId) {
            fetchQuiz(quizId);
        }
    }, [quizId]);

    const fetchQuiz = async (quizId) => {
        try {
            const quiz = await getQuizById(quizId);
            setQuiz(quiz);
            const questionPromises = quiz.questions
                ? quiz.questions.map(async (questionId) => await getQuestionById(questionId))
                : [];
            const fetchedQuestions = await Promise.all(questionPromises);
            setQuestions(fetchedQuestions);
        } catch (error) {
            console.error('Failed to fetch quiz:', error);
        }
    };

    const handleAddQuestion = async (questionId) => {
        try {
            await addQuestionToQuiz(quizId, questionId);
            const newQuestion = await getQuestionById(questionId);
            setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
        } catch (error) {
            console.error('Error adding question:', error);
        } finally {
            onClose();
        }
    };

    const handleRemoveQuestion = async (questionId) => {
        try {
            await removeQuestionFromQuiz(quizId, questionId);
            setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== questionId));
        } catch (error) {
            console.error('Error removing question:', error);
        }
    };

    const handleMoveQuestion = (index, direction) => {
        const updatedQuestions = [...questions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < updatedQuestions.length) {
            const [movedQuestion] = updatedQuestions.splice(index, 1);
            updatedQuestions.splice(targetIndex, 0, movedQuestion);
            setQuestions(updatedQuestions);
        }
    };

    return (
        <Box maxW="600px" mx="auto" py={8}>
            <VStack spacing={4} align="start">
                <Heading as="h2" size="lg">Quiz Preview</Heading>
                <Divider />

                {quiz.imageUrl && <Image src={quiz.imageUrl} alt="Quiz Image" />}

                <Editable
                    defaultValue={quiz.title}
                    onSubmit={(value) => setQuiz({ ...quiz, title: value })}
                    isPreviewFocusable={false}
                >
                    <HStack>
                        <Text fontSize="xl" fontWeight="bold">Title:</Text>
                        <EditablePreview />
                        <EditableInput />
                        <IconButton icon={<EditIcon />} />
                    </HStack>
                </Editable>

                <Editable
                    defaultValue={quiz.description}
                    onSubmit={(value) => setQuiz({ ...quiz, description: value })}
                    isPreviewFocusable={false}
                >
                    <HStack>
                        <Text fontSize="xl" fontWeight="bold">Description:</Text>
                        <EditablePreview />
                        <EditableInput />
                        <IconButton icon={<EditIcon />} />
                    </HStack>
                </Editable>

                <HStack>
                    <Text fontSize="xl" fontWeight="bold">Category:</Text>
                    <Text>{quiz.category}</Text>
                </HStack>

                <HStack>
                    <Text fontSize="xl" fontWeight="bold">Difficulty:</Text>
                    <Text>{quiz.difficulty}</Text>
                </HStack>

                <Divider />

                <Heading as="h3" size="md">Questions</Heading>
                <VStack align="start" w="full" spacing={4}>
                    {questions.map((question, index) => (
                        <Box key={question.id} w="full">
                            <QuestionPreview question={question} />
                            <HStack justify="space-between" mt={2}>
                                <HStack>
                                    <IconButton
                                        icon={<ArrowUpIcon />}
                                        onClick={() => handleMoveQuestion(index, 'up')}
                                        isDisabled={index === 0}
                                    />
                                    <IconButton
                                        icon={<ArrowDownIcon />}
                                        onClick={() => handleMoveQuestion(index, 'down')}
                                        isDisabled={index === questions.length - 1}
                                    />
                                    <IconButton
                                        icon={<DeleteIcon />}
                                        onClick={() => handleRemoveQuestion(question.id)}
                                    />
                                </HStack>
                            </HStack>
                        </Box>
                    ))}
                </VStack>

                <Button colorScheme="blue" onClick={onOpen}>Add New Question</Button>

                <CreateQuestion isVisible={isOpen} onClose={onClose} onAddQuestion={handleAddQuestion} />
            </VStack>
        </Box>
    );
}
