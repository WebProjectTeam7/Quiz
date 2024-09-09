import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    VStack,
    RadioGroup,
    Radio,
    Input,
    FormControl,
    FormLabel,
    IconButton,
    Progress,
} from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { FaFlag } from 'react-icons/fa';
import { sendBugReport } from '../../services/admin.service';
import { AppContext } from '../../state/app.context';

export default function PlayQuestionModal({ isOpen, onClose, question, onAnswerSubmit, timeLimit = 30 }) {
    const { userData } = useContext(AppContext);
    const [selectedOption, setSelectedOption] = useState('');
    const [userInput, setUserInput] = useState('');
    const [timer, setTimer] = useState(timeLimit);

    useEffect(() => {
        if (isOpen) {
            setTimer(timeLimit);
            const countdown = setInterval(() => {
                setTimer((prevTimer) => Math.max(prevTimer - 1, 0));
            }, 1000);

            return () => clearInterval(countdown);
        }
    }, [isOpen, timeLimit]);

    useEffect(() => {
        if (timer === 0) {
            handleSubmitAnswer();
        }
    }, [timer]);

    const handleSubmitAnswer = () => {
        if (question.options && question.options.length > 1) {
            onAnswerSubmit(question.id, selectedOption || null);
        } else {
            onAnswerSubmit(question.id, userInput || null);
        }
        onClose();
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
            inputValidator: (value) => !value && 'You need to select a reason for reporting!',
        });

        if (reason) {
            try {
                // await sendBugReport(quizId, question.id, userData.uid, userData.username, reason);
                Swal.fire('Reported!', 'The bug has been reported to the admin.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to report the bug.', 'error');
            }
        }
    };

    const getProgressValue = () => {
        return (timer / (timeLimit)) * 100;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{question.title}</ModalHeader>
                <ModalBody>
                    <VStack align="start" spacing={4}>
                        <Text fontWeight="bold">Time Remaining: {timer} seconds</Text>
                        <Progress value={getProgressValue()} size="sm" colorScheme="red" width="100%" />
                        <Text>{question.description}</Text>
                        {question.imageUrl && (
                            <img
                                src={question.imageUrl}
                                alt="Question Visual"
                                style={{ maxHeight: '200px', objectFit: 'contain' }}
                            />
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
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <IconButton
                        aria-label="Report Question"
                        icon={<FaFlag />}
                        onClick={handleReportBug}
                        colorScheme="red"
                        mr={3}
                    />
                    <Button colorScheme="blue" onClick={handleSubmitAnswer}>
                        Submit Answer
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

PlayQuestionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    question: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
        options: PropTypes.arrayOf(PropTypes.string),
        answer: PropTypes.string.isRequired,
    }).isRequired,
    onAnswerSubmit: PropTypes.func.isRequired,
    timeLimit: PropTypes.number,
};
