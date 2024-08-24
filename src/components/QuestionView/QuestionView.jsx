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
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function QuestionView({ question, onAnswerSubmit, savedAnswer }) {
    const [selectedOption, setSelectedOption] = useState('');
    const [userInput, setUserInput] = useState('');

    useEffect(() => {
        if (question.options && question.options.length > 1) {
            setSelectedOption(savedAnswer || '');
        } else {
            setUserInput(savedAnswer || '');
        }
    }, [savedAnswer, question]);

    const handleSubmitAnswer = () => {
        if (question.options && question.options.length > 1) {
            onAnswerSubmit(question.id, selectedOption);
        } else {
            onAnswerSubmit(question.id, userInput);
        }
    };

    return (
        <Box borderWidth="1px" borderRadius="lg" p={4} mb={4}>
            <VStack align="start" spacing={4}>
                <Text fontSize="xl" fontWeight="bold">{question.title}</Text>
                <Text>{question.description}</Text>
                {question.imageUrl && (
                    <Box>
                        <img
                            src={question.imageUrl}
                            alt="Question Visual"
                            style={{ maxHeight: '200px', objectFit: 'contain' }}
                        />
                    </Box>
                )}
                {question.options && question.options.length > 1 ? (
                    <FormControl as="fieldset">
                        <FormLabel as="legend">Choose the correct option:</FormLabel>
                        <RadioGroup onChange={setSelectedOption} value={selectedOption}>
                            {question.options.map((option, index) => (
                                <Radio key={index} value={option}>
                                    {String.fromCharCode(97 + index)}. {option}
                                </Radio>
                            ))}
                        </RadioGroup>
                    </FormControl>
                ) : (
                    <FormControl>
                        <FormLabel>Provide your answer:</FormLabel>
                        <Input
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type your answer"
                        />
                    </FormControl>
                )}
                <Button colorScheme="blue" onClick={handleSubmitAnswer}>
                    Submit Answer
                </Button>
            </VStack>
        </Box>
    );
}

QuestionView.propTypes = {
    question: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
        options: PropTypes.arrayOf(PropTypes.string),
        answer: PropTypes.string.isRequired,
    }).isRequired,
    onAnswerSubmit: PropTypes.func.isRequired,
    savedAnswer: PropTypes.string,
};
