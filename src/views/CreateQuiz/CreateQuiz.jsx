import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    Stack,
    Heading,
    Divider,
    useDisclosure,
} from '@chakra-ui/react';
import { useState, useContext } from 'react';
import { AppContext } from '../../state/app.context';
import QuizAccessEnum from '../../common/access-enum';
import QuizCategoryEnum from '../../common/category-enum';
import QuizDifficultyEnum from '../../common/difficulty.enum';
import CreateQuestion from '../../components/CreateQuestion/CreateQuestion';

export default function CreateQuiz() {
    const { userData } = useContext(AppContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [quiz, setQuiz] = useState({
        author: '',
        type: QuizAccessEnum.PUBLIC,
        imageFile: null,
        title: '',
        description: '',
        timesTried: 0,
        scoreboard: [],
        category: QuizCategoryEnum.GENERAL,
        totalPoints: 100,
        difficulty: QuizDifficultyEnum.MEDIUM,
        dateStart: null,
        dateEnds: null,
        timeLimit: null,
        questions: [],
    });

    const handleInputChange = (prop) => (e) => {
        setQuiz({
            ...quiz,
            [prop]: e.target.value,
        });
    };

    const handleQuestionAdd = (question) => {
        setQuiz({
            ...quiz,
            questions: [...quiz.questions, question],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    };

    return (
        <Box maxW="600px" mx="auto" py={8}>
            <Heading as="h1" mb={6}>Create Quiz</Heading>
            <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                    <FormControl id="title" isRequired>
                        <FormLabel>Title</FormLabel>
                        <Input
                            value={quiz.title}
                            onChange={handleInputChange('title')}
                            placeholder="Enter quiz title"
                        />
                    </FormControl>

                    <FormControl id="description" isRequired>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                            value={quiz.description}
                            onChange={handleInputChange('description')}
                            placeholder="Enter quiz description"
                        />
                    </FormControl>

                    <FormControl id="category" isRequired>
                        <FormLabel>Category</FormLabel>
                        <Select
                            value={quiz.category}
                            onChange={handleInputChange('category')}
                        >
                            {Object.values(QuizCategoryEnum).map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl id="difficulty" isRequired>
                        <FormLabel>Difficulty</FormLabel>
                        <Select
                            value={quiz.difficulty}
                            onChange={handleInputChange('difficulty')}
                        >
                            {Object.values(QuizDifficultyEnum).map((difficulty) => (
                                <option key={difficulty} value={difficulty}>
                                    {difficulty}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl id="type" isRequired>
                        <FormLabel>Access Type</FormLabel>
                        <Select
                            value={quiz.type}
                            onChange={handleInputChange('type')}
                        >
                            {Object.values(QuizAccessEnum).map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl id="totalPoints" isRequired>
                        <FormLabel>Total Points</FormLabel>
                        <Input
                            value={quiz.totalPoints}
                            onChange={handleInputChange('totalPoints')}
                            type="number"
                            placeholder="Enter total points"
                        />
                    </FormControl>

                    <Divider />

                    <Heading as="h2" size="md" mb={4}>
                        Questions
                    </Heading>

                    <Button colorScheme="blue" onClick={onOpen}>
                        Add New Question
                    </Button>
                    <CreateQuestion isVisible={isOpen} onClose={onClose} />
                </Stack>

                <Button colorScheme="teal" mt={6} type="submit">
                    Create Quiz
                </Button>
            </form>
        </Box>
    );
}
