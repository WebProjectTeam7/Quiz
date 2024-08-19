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
import { useState } from 'react';
import { EditIcon, DeleteIcon, ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import QuizAccessEnum from '../../common/access-enum';
import QuizCategoryEnum from '../../common/category-enum';
import QuizDifficultyEnum from '../../common/difficulty.enum';
import CreateQuestion from '../../components/CreateQuestion/CreateQuestion';

export default function QuizPreview() {
    const [quiz, setQuiz] = useState({
        author: 'John Doe',
        type: QuizAccessEnum.PUBLIC,
        imageFile: null,
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
        questions: [
            { id: 1, title: 'Question 1' },
            { id: 2, title: 'Question 2' },
        ],
    });
    const [editField, setEditField] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleEditField = (field) => {
        setEditField(field);
    };

    const handleSaveEditField = (field, value) => {
        setQuiz((prevQuiz) => ({
            ...prevQuiz,
            [field]: value,
        }));
        setEditField('');
    };

    const handleAddQuestion = (newQuestion) => {
        setQuiz((prevQuiz) => ({
            ...prevQuiz,
            questions: [...prevQuiz.questions, newQuestion],
        }));
        onClose();
    };

    const handleRemoveQuestion = (questionId) => {
        setQuiz((prevQuiz) => ({
            ...prevQuiz,
            questions: prevQuiz.questions.filter((q) => q.id !== questionId),
        }));
    };

    const handleMoveQuestion = (index, direction) => {
        const updatedQuestions = [...quiz.questions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < updatedQuestions.length) {
            const [movedQuestion] = updatedQuestions.splice(index, 1);
            updatedQuestions.splice(targetIndex, 0, movedQuestion);
            setQuiz((prevQuiz) => ({
                ...prevQuiz,
                questions: updatedQuestions,
            }));
        }
    };

    return (
        <Box maxW="600px" mx="auto" py={8}>
            <VStack spacing={4} align="start">
                <Heading as="h2" size="lg">Quiz Preview</Heading>
                <Divider />

                {quiz.imageFile && <Image src={URL.createObjectURL(quiz.imageFile)} alt="Quiz Image" />}

                <Editable
                    defaultValue={quiz.title}
                    onSubmit={(value) => handleSaveEditField('title', value)}
                    isPreviewFocusable={false}
                >
                    <HStack>
                        <Text fontSize="xl" fontWeight="bold">Title:</Text>
                        <EditablePreview />
                        <EditableInput />
                        <IconButton icon={<EditIcon />} onClick={() => handleEditField('title')} />
                    </HStack>
                </Editable>

                <Editable
                    defaultValue={quiz.description}
                    onSubmit={(value) => handleSaveEditField('description', value)}
                    isPreviewFocusable={false}
                >
                    <HStack>
                        <Text fontSize="xl" fontWeight="bold">Description:</Text>
                        <EditablePreview />
                        <EditableInput />
                        <IconButton icon={<EditIcon />} onClick={() => handleEditField('description')} />
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
                    {quiz.questions.map((question, index) => (
                        <HStack key={question.id} w="full" justify="space-between">
                            <Text>{question.title}</Text>
                            <HStack>
                                <IconButton
                                    icon={<ArrowUpIcon />}
                                    onClick={() => handleMoveQuestion(index, 'up')}
                                    isDisabled={index === 0}
                                />
                                <IconButton
                                    icon={<ArrowDownIcon />}
                                    onClick={() => handleMoveQuestion(index, 'down')}
                                    isDisabled={index === quiz.questions.length - 1}
                                />
                                <IconButton
                                    icon={<DeleteIcon />}
                                    onClick={() => handleRemoveQuestion(question.id)}
                                />
                            </HStack>
                        </HStack>
                    ))}
                </VStack>

                <Button colorScheme="blue" onClick={onOpen}>Add New Question</Button>

                <CreateQuestion isVisible={isOpen} onClose={onClose} onAddQuestion={handleAddQuestion} />
            </VStack>
        </Box>
    );
}
