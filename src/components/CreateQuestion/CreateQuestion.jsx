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
    Textarea,
    NumberInput,
    NumberInputField,
    Select,
    VStack,
    HStack,
    IconButton,
    Switch,
} from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { AppContext } from '../../state/app.context';
import Swal from 'sweetalert2';
import propTypes from 'prop-types';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import QuizAccessEnum from '../../common/access-enum';
import { createQuestion } from '../../services/question.service';

export default function CreateQuestion({ isVisible, onClose, onAddQuestion, quizId }) {
    const { userData } = useContext(AppContext);
    const [question, setQuestion] = useState({
        author: userData?.username || 'anonymous',
        quizId: quizId && null,
        title: '',
        imageFile: null,
        description: '',
        options: [],
        answer: '',
        points: 0,
        category: '',
        access: QuizAccessEnum.PUBLIC,
        timeAmplifier: 1,
    });

    const [loading, setLoading] = useState(false);
    const [isOpenEnded, setIsOpenEnded] = useState(false);

    const updateQuestion = (prop) => (e) => {
        const value = prop === 'imageFile' ? e.target.files[0] : e.target.value;
        setQuestion((prev) => ({
            ...prev,
            [prop]: value,
        }));
    };

    const addOption = () => {
        setQuestion((prev) => ({
            ...prev,
            options: [...prev.options, ''],
        }));
    };

    const updateOption = (index) => (e) => {
        const newOptions = [...question.options];
        newOptions[index] = e.target.value;
        setQuestion((prev) => ({
            ...prev,
            options: newOptions,
        }));
    };

    const removeOption = (index) => {
        setQuestion((prev) => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const createdQuestionId = await createQuestion({
                ...question,
                options: isOpenEnded ? [] : question.options,
            });
            Swal.fire({
                icon: 'success',
                title: 'Question Created',
                text: 'You have successfully created a question.',
                confirmButtonText: 'OK',
            });
            onAddQuestion(createdQuestionId);
            setQuestion({
                author: userData?.username || '',
                title: '',
                imageFile: null,
                description: '',
                options: [],
                answer: '',
                points: 0,
                category: '',
                access: QuizAccessEnum.PUBLIC,
                timeAmplifier: 1,
            });
            setIsOpenEnded(false);
            onClose();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Creation Error',
                text: error.message,
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isVisible} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create Question</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={4}>

                            <FormControl id="title" isRequired>
                                <FormLabel>Title</FormLabel>
                                <Input
                                    value={question.title}
                                    onChange={updateQuestion('title')}
                                    type="text"
                                />
                            </FormControl>

                            <FormControl id="description" isRequired>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    value={question.description}
                                    onChange={updateQuestion('description')}
                                />
                            </FormControl>

                            <FormControl id="imageFile">
                                <FormLabel>Image (Optional)</FormLabel>
                                <Input
                                    type="file"
                                    onChange={updateQuestion('imageFile')}
                                />
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                                <FormLabel htmlFor="withOptions" mb="0">
                                    With Options
                                </FormLabel>
                                <Switch
                                    id="isOpenEnded"
                                    isChecked={isOpenEnded}
                                    onChange={() => setIsOpenEnded(!isOpenEnded)}
                                />
                                <FormLabel htmlFor="isOpenEnded" mb="0" ml={3}>
                                    Open-Ended
                                </FormLabel>
                            </FormControl>

                            {!isOpenEnded && (
                                <FormControl id="options" isRequired>
                                    <FormLabel>Options</FormLabel>
                                    {question.options.map((option, index) => (
                                        <HStack key={index} spacing={2}>
                                            <Input
                                                value={option}
                                                onChange={updateOption(index)}
                                                placeholder={`Option ${index + 1}`}
                                                isRequired
                                            />
                                            <IconButton
                                                icon={<DeleteIcon />}
                                                onClick={() => removeOption(index)}
                                                variant="outline"
                                                colorScheme="red"
                                                size="sm"
                                                isDisabled={question.options.length === 1}
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


                            <FormControl id="answer" isRequired>
                                <FormLabel>Answer</FormLabel>
                                <Input
                                    value={question.answer}
                                    onChange={updateQuestion('answer')}
                                    type="text"
                                />
                            </FormControl>

                            <FormControl id="category">
                                <FormLabel>Category (Optional)</FormLabel>
                                <Input
                                    value={question.category}
                                    onChange={updateQuestion('category')}
                                    type="text"
                                />
                            </FormControl>

                            <FormControl id="points">
                                <FormLabel>Points (Optional)</FormLabel>
                                <NumberInput
                                    value={question.points}
                                    onChange={(value) => updateQuestion('points')({ target: { value } })}
                                    min={0}
                                    step={1}
                                >
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>

                            <FormControl id="timeAmplifier">
                                <FormLabel>Time Amplifier (Optional)</FormLabel>
                                <NumberInput
                                    value={question.timeAmplifier}
                                    onChange={(value) => updateQuestion('timeAmplifier')({ target: { value } })}
                                    min={1}
                                    step={0.1}
                                >
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>

                            <FormControl id="access" isRequired>
                                <FormLabel>Access</FormLabel>
                                <Select
                                    value={question.access}
                                    onChange={updateQuestion('access')}
                                >
                                    {Object.values(QuizAccessEnum).map((access) => (
                                        <option key={access} value={access}>
                                            {access}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                        </VStack>

                        <ModalFooter mt={4}>
                            <Button
                                colorScheme="blue"
                                type="submit"
                                isLoading={loading}
                            >
                                Create
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

CreateQuestion.propTypes = {
    isVisible: propTypes.bool.isRequired,
    onClose: propTypes.func.isRequired,
    onAddQuestion: propTypes.func.isRequired,
    quizId: propTypes.string,
};
