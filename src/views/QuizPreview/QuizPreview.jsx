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
import { ArrowDownIcon, ArrowUpIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, editQuiz, updateQuestionsIdsArray, deleteQuiz } from '../../services/quiz.service';
import { getQuestionById } from '../../services/question.service';
import { deleteReportedBugs, getAllReportedBugs } from '../../services/admin.service';
import NotificationEnum from '../../common/notification-enum';
import Swal from 'sweetalert2';
import QuizAccessEnum from '../../common/access-enum';
import QuizCategoryEnum from '../../common/category-enum';
import QuizDifficultyEnum from '../../common/difficulty.enum';
import CreateQuestion from '../../components/CreateQuestion/CreateQuestion';
import QuestionPreview from '../../components/QuestionPreview/QuestionPreview';
import EditableControls from '../../components/EditableControls/EditableControls';
import SendInvitationModal from '../../components/SendInvitationModal/SendInvitationModal';
import QuizParticipantModal from '../../components/QuizParticipantModal/QuizParticipantModal';
import './QuizPreview.css';
import QuestionsFromDatabaseModal from '../../components/QuestionFromDatabaseModal/QuestionFromDatabaseModal';
import { AppContext } from '../../state/app.context';

export default function QuizPreview() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState({
        author: 'John Doe',
        type: QuizAccessEnum.PUBLIC,
        title: 'Sample Quiz',
        description: 'This is a sample quiz description.',
        timesTried: 0,
        category: QuizCategoryEnum.GENERAL,
        totalPoints: 0,
        difficulty: QuizDifficultyEnum.MEDIUM,
        dateBegins: null,
        dateEnds: null,
        timeLimit: 0,
        isActive: false,
        imageFile: null,
        summaries: [],
    });
    const [questions, setQuestions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [reports, setReports] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();
    const { isOpen: isParticipantsOpen, onOpen: onParticipantsOpen, onClose: onParticipantsClose } = useDisclosure();
    const [isModalVisible, setModalVisible] = useState(false);
    const { userData } = useContext(AppContext);
    const organizationId = userData.organizationId;

    useEffect(() => {
        if (quizId) {
            fetchQuiz(quizId);
            fetchReportedBugs(quizId);
        }
    }, [quizId]);

    const fetchQuiz = async (quizId) => {
        try {
            const fetchedQuiz = await getQuizById(quizId);
            setQuiz(fetchedQuiz);

            if (fetchedQuiz.questions && fetchedQuiz.questions.length > 0) {
                const fetchedQuestions = await Promise.all(fetchedQuiz.questions.map(id => getQuestionById(id)));
                const filteredQuestions = fetchedQuestions.filter(q => q !== null);

                if (filteredQuestions.length < fetchedQuestions.length) {
                    await updateQuestions(filteredQuestions);
                }
                setQuestions(filteredQuestions);
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
            closeModal();
        }
    };

    const handleRemoveQuestion = async (questionId) => {
        try {
            setQuestions((prevQuestions) => {
                const updatedQuestions = prevQuestions.filter(q => q.id !== questionId);
                updateQuestions(updatedQuestions);
                return updatedQuestions;
            });
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

    const handleToggleActive = async () => {
        try {
            const newActiveState = !quiz.isActive;

            setQuiz(prevState => ({ ...prevState, isActive: newActiveState }));

            await editQuiz(quizId, { ...quiz, isActive: newActiveState });

            Swal.fire({
                title: `Quiz ${newActiveState ? 'Activated' : 'Deactivated'}`,
                text: `The quiz has been ${newActiveState ? 'activated' : 'deactivated'}.`,
                icon: 'success',
            });
        } catch (error) {
            console.error('Failed to update quiz state:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to update the quiz status. Please try again.',
                icon: 'error',
            });
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

    const handleDeleteQuiz = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteQuiz(quizId);
                    Swal.fire(
                        'Deleted!',
                        'Your quiz has been deleted.',
                        'success'
                    );
                    navigate('/organizer-dashboard');
                } catch (error) {
                    console.error('Failed to delete quiz:', error);
                    Swal.fire(
                        'Error!',
                        'Failed to delete quiz. Please try again.',
                        'error'
                    );
                }
            }
        });
    };

    const fetchReportedBugs = async (quizId) => {
        try {
            const bugs = await getAllReportedBugs();
            const quizBugs = bugs.filter(bug => bug.quizId === quizId);
            setReports(quizBugs);
        } catch (error) {
            console.error('Failed to fetch reported bugs:', error);
        }
    };

    const handleResolveReport = async (reportId) => {
        try {
            await deleteReportedBugs(reportId);
            setReports(reports.filter(report => report.id !== reportId));
            Swal.fire('Resolved!', 'The reported bug has been resolved.', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to resolve the bug.', 'error');
        }
    };

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    return (
        <Box maxW="800px" mx="auto" py={8}>
            <VStack spacing={4} align="start">
                <Heading as="h2" size="lg">Quiz Preview</Heading>
                <Divider />

                {quiz.imageFile && <Image src={quiz.imageFile} alt="Quiz Image" />}

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
                    <Text fontSize="xl" fontWeight="bold">Times Played:</Text>
                    <Text>{quiz.summaries ? Object.values(quiz.summaries).flat().length : 0}</Text>
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

                {quiz.type === QuizAccessEnum.PRIVATE && (
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
                )}

                <HStack>
                    <Text fontSize="xl" fontWeight="bold">Time Limit (minutes):</Text>
                    <Editable
                        value={quiz.timeLimit ? quiz.timeLimit.toString() : ''}
                        onChange={(value) => setQuiz({ ...quiz, timeLimit: parseInt(value, 10) })}
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

                <HStack spacing={4}>
                    <Button colorScheme="blue" onClick={onOpen}>
                        Add Question
                    </Button>

                    <Button colorScheme="blue" onClick={openModal}>
                        Question from Database
                    </Button>

                    <Button colorScheme="blue" onClick={handleTestQuiz}>
                        Test Quiz
                    </Button>

                </HStack>
                <HStack spacing={4}>
                    <Button colorScheme="blue" onClick={onParticipantsOpen}>
                        Quiz Participants
                    </Button>

                    {quiz.type === QuizAccessEnum.PRIVATE && (
                        <Button colorScheme="blue" onClick={onInviteOpen}>
                        Send Invitation
                        </Button>
                    )}
                </HStack>

                <HStack spacing={4}>
                    <Button colorScheme={quiz.isActive ? 'red' : 'green'} onClick={handleToggleActive}>
                        {quiz.isActive ? 'Deactivate Quiz' : 'Activate Quiz'}
                    </Button>

                    <Button colorScheme="red" onClick={handleDeleteQuiz}>
                        Delete Quiz
                    </Button>
                </HStack>

                <VStack spacing={4} align="start">
                    {questions.length > 0 ? questions.map((question, index) => {
                        const report = reports.find(r => r.questionId === question.id);

                        return (
                            <Box
                                key={question.id}
                                borderWidth={1}
                                p={4}
                                borderRadius="md"
                                shadow="md"
                                borderColor={report ? 'red.500' : 'gray.200'}
                            >
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
                                    {report && (
                                        <>
                                            <Box textAlign="left">
                                                <Text color="red.500" fontWeight="bold" mb={0}>
                                                    Reported for:
                                                </Text>
                                                <Text color="red.500" fontWeight="bold" mt={0}>
                                                    {report.reason}
                                                </Text>
                                            </Box>
                                            <Button
                                                colorScheme="green"
                                                onClick={() => handleResolveReport(report.id)}
                                            >
                                                Resolved
                                            </Button>
                                        </>
                                    )}
                                </HStack>
                            </Box>
                        );
                    }) : <Text>No questions added yet.</Text>}
                </VStack>
            </VStack>

            <CreateQuestion isVisible={isOpen} onClose={onClose} onAddQuestion={handleAddQuestion} quizId={quizId} />
            <SendInvitationModal isOpen={isInviteOpen} onClose={onInviteClose} objId={quizId} obj={quiz} objType={NotificationEnum.INVITE_TO_QUIZ} />
            <QuizParticipantModal isOpen={isParticipantsOpen} onClose={onParticipantsClose} quiz={quiz} />
            <QuestionsFromDatabaseModal
                isOpen={isModalVisible}
                onClose={closeModal}
                onAddQuestion={handleAddQuestion}
                categories={Object.values(QuizCategoryEnum)}
                organizationId={organizationId}
                currentUsername={userData.username}
            />
        </Box>
    );
}
