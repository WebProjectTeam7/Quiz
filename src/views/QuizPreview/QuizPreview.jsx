import {
    Box,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Divider,
    IconButton,
    Editable,
    EditableInput,
    EditablePreview,
    useDisclosure,
    Select,
    Input,
    Image,
    EditableTextarea,
    Spinner,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DeleteIcon, ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import QuizAccessEnum from '../../common/access-enum';
import QuizCategoryEnum from '../../common/category-enum';
import QuizDifficultyEnum from '../../common/difficulty.enum';
import CreateQuestion from '../../components/CreateQuestion/CreateQuestion';
import QuestionPreview from '../../components/QuestionPreview/QuestionPreview';
import { getQuizById, editQuiz, updateQuestionsIdsArray } from '../../services/quiz.service';
import { getQuestionById } from '../../services/question.service';
import Swal from 'sweetalert2';
import EditableControls from '../../components/EditableControls/EditableControls';

export default function QuizPreview() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState({
        author: 'John Doe',
        type: QuizAccessEnum.PUBLIC,
        imageUrl: null,
        title: 'Sample Quiz',
        description: 'This is a sample quiz description.',
        timesTried: 0,
        scoreboard: [],
        category: QuizCategoryEnum.GENERAL,
        totalPoints: 0,
        difficulty: QuizDifficultyEnum.MEDIUM,
        dateBegins: null,
        dateEnds: null,
        timeLimit: 0,
    });
    const [questions, setQuestions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (quizId) {
            fetchQuiz(quizId);
        }
    }, [quizId]);

    const fetchQuiz = async (quizId) => {
        try {
            const fetchedQuiz = await getQuizById(quizId);
            setQuiz(fetchedQuiz);
            if (fetchedQuiz.questions && fetchedQuiz.questions.length > 0) {
                const fetchedQuestions = await Promise.all(fetchedQuiz.questions
                    .map(async (questionId) => await getQuestionById(questionId))
                    .filter(q => q !== null));
                setQuestions(fetchedQuestions);
            }
        } catch (error) {
            console.error('Failed to fetch quiz:', error);
        }
    };

    const updateQuestions = async (updatedQuestions) => {
        try {
            const updatedQuestionsIdsArray = updatedQuestions.map(q => q.id);
            await updateQuestionsIdsArray(quizId, updatedQuestionsIdsArray);
            await fetchQuiz(quizId);
        } catch (error) {
            console.error('Error updating questions', error);
        }
    };

    const handleAddQuestion = async (questionId) => {
        try {
            const newQuestion = await getQuestionById(questionId);
            setQuestions((prevQuestions) => {
                const updatedQuestions = [...prevQuestions, newQuestion];
                updateQuestions(updatedQuestions);
                return updatedQuestions;
            });
        } catch (error) {
            console.error('Error adding question:', error);
        } finally {
            onClose();
        }
    };

    const handleRemoveQuestion = async (questionId) => {
        try {
            setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== questionId));
            await updateQuestions(questions);
        } catch (error) {
            console.error('Error removing question:', error);
        }
    };

    const handleMoveQuestion = async (index, direction) => {
        const updatedQuestions = [...questions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < updatedQuestions.length) {
            const [movedQuestion] = updatedQuestions.splice(index, 1);
            updatedQuestions.splice(targetIndex, 0, movedQuestion);
            setQuestions(updatedQuestions);
            await updateQuestions(updatedQuestions);
        }
    };

    const handleTestQuiz = () => {
        navigate(`/play-quiz/${quizId}`);
    };


    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await editQuiz(quizId, quiz);
            Swal.fire({
                title: 'Quiz saved.',
                text: 'Your changes have been saved successfully.',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Failed to save quiz:', error);
            Swal.fire({
                title: 'Error.',
                text: 'Failed to save changes. Please try again.',
                icon: 'error',
                timer: 3000,
                showConfirmButton: false,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box maxW="800px" mx="auto" py={8}>
            <VStack spacing={4} align="start">
                <Heading as="h2" size="lg">Quiz Preview</Heading>
                <Divider />

                {quiz.imageUrl && <Image src={quiz.imageUrl} alt="Quiz Image" />}

                <Editable
                    value={quiz.title}
                    onChange={(value) => setQuiz({ ...quiz, title: value })}
                    isPreviewFocusable={false}
                >
                    <HStack>
                        <Text fontSize="xl" fontWeight="bold">Title:</Text>
                        <EditablePreview />
                        <EditableInput />
                        <EditableControls />
                    </HStack>
                </Editable>

                <Editable
                    value={quiz.description}
                    onChange={(value) => setQuiz({ ...quiz, description: value })}
                    isPreviewFocusable={false}
                >
                    <HStack>
                        <Text fontSize="xl" fontWeight="bold">Description:</Text>
                        <EditablePreview />
                        <EditableTextarea />
                        <EditableControls />
                    </HStack>
                </Editable>

                <HStack>
                    <Text fontSize="xl" fontWeight="bold">Author:</Text>
                    <Text>{quiz.author}</Text>
                </HStack>

                <HStack>
                    <Text fontSize="xl" fontWeight="bold">Type:</Text>
                    <Select
                        value={quiz.type}
                        onChange={(e) => setQuiz({ ...quiz, type: e.target.value })}
                    >
                        {Object.values(QuizAccessEnum).map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </Select>

                    <Text fontSize="xl" fontWeight="bold">Category:</Text>
                    <Select
                        value={quiz.category}
                        onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
                    >
                        {Object.values(QuizCategoryEnum).map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </Select>

                    <Text fontSize="xl" fontWeight="bold">Difficulty:</Text>
                    <Select
                        value={quiz.difficulty}
                        onChange={(e) => setQuiz({ ...quiz, difficulty: e.target.value })}
                    >
                        {Object.values(QuizDifficultyEnum).map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                                {difficulty}
                            </option>
                        ))}
                    </Select>
                </HStack>

                <HStack>
                    <Text fontSize="xl" fontWeight="bold">Times Tried:</Text>
                    <Text>{quiz.timesTried}</Text>
                </HStack>

                <HStack>
                    <Text fontSize="xl" fontWeight="bold">Total Points:</Text>
                    <Editable
                        value={quiz.totalPoints.toString()}
                        onChange={(value) => setQuiz({ ...quiz, totalPoints: parseInt(value, 10) })}
                        isPreviewFocusable={false}
                    >
                        <HStack>
                            <EditablePreview />
                            <EditableInput type='number' />
                            <EditableControls />
                        </HStack>
                    </Editable>
                </HStack>

                <HStack>
                    <Text fontSize="xl" fontWeight="bold">Date Start:</Text>
                    <Input
                        type="datetime-local"
                        value={quiz.dateBegins ? new Date(quiz.dateBegins).toISOString().slice(0, -8) : ''}
                        onChange={(e) => setQuiz({ ...quiz, dateBegins: new Date(e.target.value).toISOString() })}
                    />
                    <Text fontSize="xl" fontWeight="bold">Date End:</Text>
                    <Input
                        type="datetime-local"
                        value={quiz.dateEnds ? new Date(quiz.dateEnds).toISOString().slice(0, -8) : ''}
                        onChange={(e) => setQuiz({ ...quiz, dateEnds: new Date(e.target.value).toISOString() })}
                    />
                </HStack>

                <HStack>
                    <Text fontSize="xl" fontWeight="bold">Time Limit (minutes):</Text>
                    <Editable
                        value={quiz.timeLimit ? quiz.timeLimit.toString() : ''}
                        onChange={(value) => setQuiz({ ...quiz, timeLimit: value })}
                        isPreviewFocusable={false}
                    >
                        <HStack>
                            <EditablePreview />
                            <EditableInput type="number" />
                            <EditableControls />
                        </HStack>
                    </Editable>
                </HStack>

                <Button colorScheme="teal" onClick={handleSaveChanges} isLoading={isSaving}>
                    Save Changes
                </Button>

                <Button colorScheme="blue" onClick={onOpen}>
                    Add Question
                </Button>

                <Button onClick={handleTestQuiz} colorScheme="teal" mt={4}>
                    Test Quiz
                </Button>

                <VStack spacing={4} align="start">
                    {questions.length > 0 ? questions.map((question, index) => (
                        <Box key={question.id} borderWidth={1} p={4} borderRadius="md" shadow="md">
                            <QuestionPreview question={question} />
                            <HStack mt={2} spacing={4}>
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
                                    colorScheme="red"
                                    onClick={() => handleRemoveQuestion(question.id)}
                                />
                            </HStack>
                        </Box>
                    )) : <Text>No questions added yet.</Text>}
                </VStack>
            </VStack>

            <CreateQuestion isVisible={isOpen} onClose={onClose} onAddQuestion={handleAddQuestion} quizId={quizId} />
        </Box>
    );
}
