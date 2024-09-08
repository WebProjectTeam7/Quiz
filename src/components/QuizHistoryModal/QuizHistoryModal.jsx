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
    Box,
} from '@chakra-ui/react';
import './QuizHistoryModal.css';

const QuizHistoryModal = ({ isOpen, onClose, quizHistory }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent maxWidth="700px" mx="auto">
                <ModalHeader>Quiz History</ModalHeader>
                <ModalBody>
                    {quizHistory.length > 0 ? (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Quiz Name</Th>
                                    <Th>Points</Th>
                                    <Th>Date</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {quizHistory.map((quiz, index) => (
                                    <Tr key={index}>
                                        <Td>{quiz.title}</Td>
                                        <Td>{quiz.points}</Td>
                                        <Td>{new Date(quiz.date).toLocaleString('en-US')}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    ) : (
                        <Box>No quizzes found.</Box>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

QuizHistoryModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    quizHistory: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            points: PropTypes.number.isRequired,
            date: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default QuizHistoryModal;
