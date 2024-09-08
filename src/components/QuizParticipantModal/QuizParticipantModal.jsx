import PropTypes from 'prop-types';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const QuizParticipantModal = ({ isOpen, onClose, quiz }) => {
    const navigate = useNavigate();

    const handleViewSummary = (summary) => {
        navigate('/quiz-summary', { state: { summary } });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent maxWidth="700px" mx="auto">
                <ModalHeader>Quiz Participants</ModalHeader>
                <ModalBody>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Username</Th>
                                <Th>Points</Th>
                                <Th>Date</Th>
                                <Th>Quiz Summary</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {quiz.summaries ? (
                                Object.entries(quiz.summaries).flatMap(([username, summaries]) =>
                                    summaries.map((summary, index) => (
                                        <Tr key={`${username}-${index}`}>
                                            <Td>{username}</Td>
                                            <Td>{summary.points}</Td>
                                            <Td>{new Date(summary.date).toLocaleString()}</Td>
                                            <Td>
                                                <Button
                                                    colorScheme="blue"
                                                    onClick={() => handleViewSummary(summary)}
                                                >
                                                    Overview
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))
                                )
                            ) : (
                                <Tr>
                                    <Td colSpan="4">No Entries</Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="red" ml={3} onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

QuizParticipantModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    quiz: PropTypes.shape({
        summaries: PropTypes.objectOf(
            PropTypes.arrayOf(
                PropTypes.shape({
                    points: PropTypes.number.isRequired,
                    date: PropTypes.string.isRequired,
                    questions: PropTypes.array.isRequired,
                })
            )
        ).isRequired,
    }).isRequired,
};

export default QuizParticipantModal;
