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
    IconButton,
} from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { FaFlag } from 'react-icons/fa';
import { sendBugReport  } from '../../services/admin.service';
import { AppContext } from '../../state/app.context';
import { useParams } from 'react-router-dom';

export default function QuestionView({ question, onAnswerSubmit, savedAnswer }) {
    const [selectedOption, setSelectedOption] = useState('');
    const [userInput, setUserInput] = useState('');
    const { userData } = useContext(AppContext);
    const { quizId } = useParams();

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

    const handleReportBug = async () => {
        const { value: reason } = await Swal.fire({
            title: 'Report a Bug',
            input: 'select',
            inputOptions: {
                'Wrong Question': 'Wrong Question',
                'Wrong Answer': 'Wrong Answer',
                'Doesn\'t Work': 'Doesn\'t Work',
                'Something Else': 'Something Else',
            },
            inputPlaceholder: 'Select a reason',
            showCancelButton: true,
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value) {
                        resolve();
                    } else {
                        resolve('You need to select a reason for reporting!');
                    }
                });
            },
        });

        if (reason) {
            try {
                await sendBugReport(quizId, question.id, userData.uid, userData.username, reason);
                Swal.fire('Reported!', 'The bug has been reported to the admin.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to report the bug.', 'error');
            }
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
                <IconButton
                    aria-label="Report Question"
                    icon={<FaFlag />}
                    onClick={handleReportBug}
                    colorScheme="red"
                />
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
