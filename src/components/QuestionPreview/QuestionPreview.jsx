import {
    Box,
    Text,
    VStack,
    RadioGroup,
    Radio,
    Input,
    Button,
    FormControl,
    FormLabel,
    Textarea,
    NumberInput,
    NumberInputField,
    Select,
    HStack,
    IconButton,
    Switch,
    Image,
    SimpleGrid,
} from '@chakra-ui/react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { deleteQuestion, updateQuestion } from '../../services/question.service';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import QuizAccessEnum from '../../common/access-enum';
import QuizCategoryEnum from '../../common/category-enum';
import './QuestionPreview.css';

export default function QuestionPreview({ question }) {
    const [selectedOption, setSelectedOption] = useState('');
    const [userInput, setUserInput] = useState('');
    const [showIsCorrect, setShowIsCorrect] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableQuestion, setEditableQuestion] = useState({ ...question });
    const [imagePreview, setImagePreview] = useState(question.imageUrl || '');
    const [imageFile, setImageFile] = useState(null);
    const [isOpenEnded, setIsOpenEnded] = useState(!question.options || question.options.length === 0);

    const handleCheckAnswer = () => {
        if (!editableQuestion.options || editableQuestion.options.length === 0) {
            setIsCorrect(userInput.trim().toLowerCase() === editableQuestion.answer.trim().toLowerCase());
        } else {
            setIsCorrect(selectedOption.trim().toLowerCase() === editableQuestion.answer.trim().toLowerCase());
        }
        setShowIsCorrect(true);
    };

    const handleEditQuestion = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditableQuestion({ ...question });
        setImagePreview(question.imageUrl || '');
        setImageFile(null);
    };

    const handleSaveChanges = async () => {
        try {
            const updatedQuestion = { ...editableQuestion };

            if (imageFile) {
                updatedQuestion.imageFile = imageFile;
            } else if (imagePreview === '') {
                updatedQuestion.imageUrl = '';
            }

            await updateQuestion(editableQuestion.id, updatedQuestion);

            setIsEditing(false);
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    const handleDeleteQuestion = async () => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'You won’t be able to revert this!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            });

            if (result.isConfirmed) {
                await deleteQuestion(editableQuestion.id);
                Swal.fire('Deleted!', 'Your question has been deleted.', 'success');

                window.location.reload();
            }
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
            setImageFile(file);
        } else {
            setEditableQuestion((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleRemoveImage = () => {
        setImagePreview('');
        setImageFile(null);
        setEditableQuestion((prev) => ({
            ...prev,
            imageUrl: '',
        }));
    };

    const addOption = () => {
        setEditableQuestion((prev) => ({
            ...prev,
            options: [...prev.options, ''],
        }));
    };

    const updateOption = (index) => (e) => {
        const newOptions = [...editableQuestion.options];
        newOptions[index] = e.target.value;
        setEditableQuestion((prev) => ({
            ...prev,
            options: newOptions,
        }));
    };

    const removeOption = (index) => {
        setEditableQuestion((prev) => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }));
    };

    const handleToggleAnswer = () => {
        setShowAnswer(!showAnswer);
    };

    return (
        <Box className="question-preview-container">
            <VStack spacing={4} align="start">
                {isEditing ? (
                    <>
                        <FormControl>
                            <FormLabel>Title</FormLabel>
                            <Input
                                name="title"
                                value={editableQuestion.title}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                name="description"
                                value={editableQuestion.description}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Image (Optional)</FormLabel>
                            <Input
                                type="file"
                                name="imageFile"
                                onChange={handleInputChange}
                                accept="image/*"
                            />
                            {imagePreview && (
                                <VStack align="start" spacing={2} mt={2}>
                                    <Image
                                        src={imagePreview}
                                        alt="Image Preview"
                                        maxHeight="200px"
                                        objectFit="contain"
                                    />
                                    <Button
                                        colorScheme="red"
                                        size="sm"
                                        onClick={handleRemoveImage}
                                    >
                                        Remove Image
                                    </Button>
                                </VStack>
                            )}
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">With Options</FormLabel>
                            <Switch
                                isChecked={!isOpenEnded}
                                onChange={() => setIsOpenEnded(!isOpenEnded)}
                            />
                        </FormControl>
                        {!isOpenEnded && (
                            <FormControl>
                                <FormLabel>Options</FormLabel>
                                {editableQuestion.options.map((option, index) => (
                                    <HStack key={index} spacing={2}>
                                        <Input
                                            value={option}
                                            onChange={updateOption(index)}
                                            placeholder={`Option ${index + 1}`}
                                        />
                                        <IconButton
                                            icon={<DeleteIcon />}
                                            onClick={() => removeOption(index)}
                                            variant="outline"
                                            colorScheme="red"
                                            size="sm"
                                            isDisabled={editableQuestion.options.length === 1}
                                        />
                                    </HStack>
                                ))}
                                <Button
                                    leftIcon={<AddIcon />}
                                    onClick={addOption}
                                    variant="link"
                                    colorScheme="blue"
                                    size="sm"
                                    mt={2}
                                >
                                    Add Option
                                </Button>
                            </FormControl>
                        )}
                        <FormControl>
                            <FormLabel>Answer</FormLabel>
                            <Input
                                name="answer"
                                value={editableQuestion.answer}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Category</FormLabel>
                            <Select
                                name="category"
                                value={editableQuestion.category}
                                onChange={handleInputChange}
                            >
                                {Object.values(QuizCategoryEnum).map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Points</FormLabel>
                            <NumberInput
                                name="points"
                                value={editableQuestion.points}
                                onChange={(value) => handleInputChange({ target: { name: 'points', value } })}
                                min={0}
                                step={1}
                            >
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Time Amplifier</FormLabel>
                            <NumberInput
                                name="timeAmplifier"
                                value={editableQuestion.timeAmplifier}
                                onChange={(value) => handleInputChange({ target: { name: 'timeAmplifier', value } })}
                                min={1}
                                step={0.1}
                            >
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Access</FormLabel>
                            <Select
                                name="access"
                                value={editableQuestion.access}
                                onChange={handleInputChange}
                            >
                                {Object.values(QuizAccessEnum).map((access) => (
                                    <option key={access} value={access}>
                                        {access}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                        <Button colorScheme="blue" onClick={handleSaveChanges}>
                            Save Changes
                        </Button>
                        <Button colorScheme="gray" onClick={handleCancelEdit}>
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <Text fontWeight="bold">{editableQuestion.title}</Text>
                        <Text>{editableQuestion.description}</Text>
                        {imagePreview && (
                            <Image
                                src={imagePreview}
                                alt="Question Image"
                                maxHeight="200px"
                                mt={2}
                                objectFit="contain"
                            />
                        )}
                        {editableQuestion.options && editableQuestion.options.length > 0 ? (
                            <FormControl>
                                <FormLabel>Select an option:</FormLabel>
                                <RadioGroup
                                    name="quiz-options"
                                    onChange={setSelectedOption}
                                    value={selectedOption}
                                >
                                    <SimpleGrid columns={2} spacing={4}>
                                        {editableQuestion.options.map((option, index) => (
                                            <Radio key={index} value={option}>
                                                {option}
                                            </Radio>
                                        ))}
                                    </SimpleGrid>
                                </RadioGroup>
                            </FormControl>
                        ) : (
                            <FormControl>
                                <FormLabel>Enter your answer:</FormLabel>
                                <Input
                                    type="text"
                                    name="user-answer"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Type your answer"
                                />
                            </FormControl>
                        )}
                        <HStack spacing={4} mt={2}>
                            <Button onClick={handleCheckAnswer} colorScheme="blue">
                                Check Answer
                            </Button>
                            <Button onClick={handleToggleAnswer} colorScheme="yellow">
                                {showAnswer ? 'Hide' : 'Show'} Answer
                            </Button>
                        </HStack>
                        {showIsCorrect && (isCorrect ? (
                            <Text fontWeight="bold" color='green.500'>
                                Correct!
                            </Text>
                        ) : (
                            <Text fontWeight="bold" color='red.500'>
                                Incorrect!
                            </Text>
                        ))}
                        {showAnswer && (
                            <Text fontWeight="bold" color='yellow.500'>
                                The correct answer is: {editableQuestion.answer}
                            </Text>
                        )}
                        <HStack spacing={4} mt={4}>
                            <Button onClick={handleEditQuestion} colorScheme="green">
                                Edit Question
                            </Button>
                            <Button onClick={handleDeleteQuestion} colorScheme="red">
                                Delete From DB
                            </Button>
                        </HStack>
                    </>
                )}
            </VStack>
        </Box>
    );
}

QuestionPreview.propTypes = {
    question: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        imageUrl: PropTypes.string,
        options: PropTypes.arrayOf(PropTypes.string),
        answer: PropTypes.string.isRequired,
        points: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        category: PropTypes.string,
        timeAmplifier: PropTypes.number,
        access: PropTypes.string,
    }).isRequired,
};
