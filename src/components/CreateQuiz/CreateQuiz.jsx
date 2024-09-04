import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    Stack,
    Checkbox,
    Divider,
} from '@chakra-ui/react';
import Swal from 'sweetalert2';
import QuizAccessEnum from '../../common/access-enum';
import QuizCategoryEnum from '../../common/category-enum';
import QuizDifficultyEnum from '../../common/difficulty.enum';
import { createQuiz } from '../../services/quiz.service';
import { useNavigate } from 'react-router-dom';
import './CreateQuiz.css';

export default function CreateQuiz({ username, isOpen, onClose }) {
    const navigate = useNavigate();

    const [useDateRange, setUseDateRange] = useState(false);
    const [useTimeLimit, setUseTimeLimit] = useState(false);
    const [quiz, setQuiz] = useState({
        author: username,
        type: QuizAccessEnum.PUBLIC,
        title: '',
        description: '',
        category: QuizCategoryEnum.GENERAL,
        totalPoints: 100,
        difficulty: QuizDifficultyEnum.MEDIUM,
        dateBegins: null,
        dateEnds: null,
        timeLimit: null,
    });

    const handleInputChange = (prop) => (e) => {
        setQuiz({
            ...quiz,
            [prop]: e.target.value,
        });
    };

    const validateForm = () => {
        const { title, description, category, difficulty, type, totalPoints } = quiz;
        if (!title || !description || !category || !difficulty || !type || !totalPoints) {
            Swal.fire({
                title: 'Missing Information',
                text: 'Please fill in all required fields.',
                icon: 'warning',
                confirmButtonText: 'OK',
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const newQuiz = {
                ...quiz,
                dateBegins: useDateRange ? quiz.dateBegins : null,
                dateEnds: useDateRange ? quiz.dateEnds : null,
                timeLimit: useTimeLimit ? quiz.timeLimit : null,
                author: username || 'anonymous',
            };
            const quizId = await createQuiz(newQuiz);

            Swal.fire({
                title: 'Quiz Created!',
                text: 'Your quiz has been created successfully.',
                icon: 'success',
                confirmButtonText: 'OK',
            }).then(() => {
                navigate(`/quiz-preview/${quizId}`);
                onClose();
            });
        } catch (error) {
            console.error('Failed to create quiz:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to create quiz. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent className="create-quiz-container">
                <ModalHeader>Create Quiz</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
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
                                    className="custom-select"
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
                    </form>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="teal" onClick={handleSubmit}>
                        Create Quiz
                    </Button>
                    <Button variant="ghost" onClick={onClose} ml={3}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

CreateQuiz.propTypes = {
    username: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};
