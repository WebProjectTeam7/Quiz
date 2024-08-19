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
    Checkbox,
} from '@chakra-ui/react';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/app.context';
import QuizAccessEnum from '../../common/access-enum';
import QuizCategoryEnum from '../../common/category-enum';
import QuizDifficultyEnum from '../../common/difficulty.enum';
import { createQuiz } from '../../services/quiz.service';

export default function CreateQuiz() {
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();

    const [useDateRange, setUseDateRange] = useState(false);
    const [useTimeLimit, setUseTimeLimit] = useState(false);
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
        dateBegins: null,
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setQuiz({ ...quiz, imageFile: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newQuiz = {
                ...quiz,
                dateBegins: useDateRange ? quiz.dateBegins : null,
                dateEnds: useDateRange ? quiz.dateEnds : null,
                timeLimit: useTimeLimit ? quiz.timeLimit : null,
                author: userData ? userData.username : 'anonymous author',
            };
            const quizId = await createQuiz(newQuiz);
            navigate(`/quiz-preview/${quizId}`);
        } catch (error) {
            console.error('Failed to create quiz:', error);
        }
    };

    return (
        <Box maxW="600px" mx="auto" py={8}>
            <Heading as="h1" mb={6}>Create Quiz</Heading>
            <form onSubmit={handleSubmit}>
                <Stack spacing={4}>

                    <FormControl id="imageFile">
                        <FormLabel>Quiz Image</FormLabel>
                        <input
                            type="file"
                            onChange={handleFileChange}
                        />
                    </FormControl>

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

                    <FormControl display="flex" alignItems="center">
                        <Checkbox
                            isChecked={useDateRange}
                            onChange={(e) => setUseDateRange(e.target.checked)}
                        >
                            Set Date Range?
                        </Checkbox>
                    </FormControl>

                    {useDateRange && (
                        <>
                            <FormControl id="dateBegins">
                                <FormLabel>Date Begins</FormLabel>
                                <Input
                                    value={quiz.dateBegins || ''}
                                    onChange={handleInputChange('dateBegins')}
                                    type="date"
                                    placeholder="Select the start date"
                                />
                            </FormControl>

                            <FormControl id="dateEnds">
                                <FormLabel>Date Ends</FormLabel>
                                <Input
                                    value={quiz.dateEnds || ''}
                                    onChange={handleInputChange('dateEnds')}
                                    type="date"
                                    placeholder="Select the end date"
                                />
                            </FormControl>
                        </>
                    )}

                    <FormControl display="flex" alignItems="center">
                        <Checkbox
                            isChecked={useTimeLimit}
                            onChange={(e) => {
                                setUseTimeLimit(e.target.checked);
                                if (!e.target.checked) {
                                    setQuiz({ ...quiz, timeLimit: null });
                                }
                            }}
                        >
                            Set Time Limit?
                        </Checkbox>
                    </FormControl>

                    {useTimeLimit && (
                        <FormControl id="timeLimit">
                            <FormLabel>Time Limit (minutes)</FormLabel>
                            <Input
                                value={quiz.timeLimit || ''}
                                onChange={handleInputChange('timeLimit')}
                                type="number"
                                placeholder="Enter time limit in minutes"
                            />
                        </FormControl>
                    )}

                    <Divider />

                </Stack>

                <Button colorScheme="teal" mt={6} type="submit">
                    Create Quiz
                </Button>
            </form>
        </Box>
    );
}
