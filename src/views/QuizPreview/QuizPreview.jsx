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
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DeleteIcon, ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import QuizAccessEnum from '../../common/access-enum';
import QuizCategoryEnum from '../../common/category-enum';
import QuizDifficultyEnum from '../../common/difficulty.enum';
import CreateQuestion from '../../components/CreateQuestion/CreateQuestion';
import QuestionPreview from '../../components/QuestionPreview/QuestionPreview';
import { addQuestionToQuiz, getQuizById, removeQuestionFromQuiz, editQuiz } from '../../services/quiz.service';
import { getQuestionById, getQuestionsByQuizId } from '../../services/question.service';
import Swal from 'sweetalert2';
import EditableControls from '../../components/EditableControls/EditableControls';

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
                const fetchedQuestions = await getQuestionsByQuizId(quizId);
                setQuestions(fetchedQuestions);
            }
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
                    onSubmit={(value) => setQuiz({ ...quiz, title: value })}
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
                    onSubmit={(value) => setQuiz({ ...quiz, description: value })}
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
                        onSubmit={(value) => setQuiz({ ...quiz, totalPoints: parseInt(value, 10) })}
                        isPreviewFocusable={false}
                    >
                        <HStack>
                            <EditablePreview />
                            <EditableInput type="number" />
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
                        onSubmit={(value) => setQuiz({ ...quiz, timeLimit: value })}
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

                <VStack spacing={4} align="start">
                    {questions.length > 0  && questions.map((question, index) => (
                        <Box key={question.id} borderWidth={1} p={4} borderRadius="md">
                            <HStack spacing={4} align="center">
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
                                <Text>{question.text}</Text>
                                <IconButton
                                    icon={<DeleteIcon />}
                                    onClick={() => handleRemoveQuestion(question.id)}
                                />
                            </HStack>
                            <QuestionPreview question={question} />
                        </Box>
                    ))}
                </VStack>
            </VStack>

            <CreateQuestion isVisible={isOpen} onClose={onClose} onAddQuestion={handleAddQuestion} quizId={quizId} />
        </Box>
    );
}
