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
} from '@chakra-ui/react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import './QuestionPreview.css';

export default function QuestionPreview({ question }) {
    const [selectedOption, setSelectedOption] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);

    const handleCheckAnswer = () => {
        if (question.options && question.options.length > 1) {
            setIsCorrect(selectedOption === question.answer);
        } else {
            setIsCorrect(userInput.trim().toLowerCase() === question.answer.trim().toLowerCase());
        }
    };

    const handleToggleAnswer = () => {
        setShowAnswer(!showAnswer);
    };

    return (
        <Box className="question-preview-container" borderWidth="1px" borderRadius="lg" p={4} mb={4}>
            <VStack align="start" spacing={4}>
                <Text className="question-preview-title" fontSize="xl" fontWeight="bold">
                    {question.title}
                </Text>
                <Text className="question-preview-description">{question.description}</Text>
                {question.imageUrl && (
                    <Box>
                        <img
                            src={question.imageUrl}
                            alt="Quiz Visual"
                            style={{ maxHeight: '200px', objectFit: 'contain' }}
                        />
                    </Box>
                )}
                {question.options && question.options.length > 1 ? (
                    <FormControl as="fieldset" className="question-preview-form-control">
                        <FormLabel as="legend" className="question-preview-form-label">Choose the correct option:</FormLabel>
                        <RadioGroup onChange={setSelectedOption} value={selectedOption}>
                            {question.options.map((option, index) => (
                                <Radio key={index} value={option}>
                                    {String.fromCharCode(97 + index)}. {option}
                                </Radio>
                            ))}
                        </RadioGroup>
                    </FormControl>
                ) : (
                    <FormControl className="question-preview-form-control">
                        <FormLabel className="question-preview-form-label">Provide your answer:</FormLabel>
                        <Input
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type your answer"
                        />
                    </FormControl>
                )}
                <Button colorScheme="blue" onClick={handleCheckAnswer}>
                    Check Answer
                </Button>
                {isCorrect !== null && (
                    <Text fontSize="lg" fontWeight="bold" color={isCorrect ? 'green.500' : 'red.500'}>
                        {isCorrect ? 'Correct!' : 'Incorrect!'}
                    </Text>
                )}
                <Button colorScheme="teal" variant="ghost" onClick={handleToggleAnswer} mt={2}>
                    {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </Button>
                {showAnswer && (
                    <Text fontSize="lg" mt={2} p={2} bg="gray.100" borderRadius="md">
                        {question.answer}
                    </Text>
                )}
            </VStack>
        </Box>
    );
}

QuestionPreview.propTypes = {
    question: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
        options: PropTypes.arrayOf(PropTypes.string),
        answer: PropTypes.string.isRequired,
    }).isRequired,
};
