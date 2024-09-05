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
    Link,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const QuizParticipantModal = ({ isOpen, onClose, quiz }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" color={'white'}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Quiz Participants</ModalHeader>
                <ModalBody>
                    <Table variant="simple">
                        <Thead>
                            <Tr >
                                <Th>Username</Th>
                                <Th>Points</Th>
                                <Th>Date</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {Object.entries(quiz.summaries).flatMap(([username, summaries]) =>
                                summaries.map((summary, index) => (
                                    <Tr key={`${username}-${index}`}>
                                        <Td>{username}</Td>
                                        <Td>{summary.points}</Td>
                                        <Td>{new Date(summary.date).toLocaleString()}</Td>
                                    </Tr>
                                ))
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
                })
            )
        ).isRequired,
    }).isRequired,
};

export default QuizParticipantModal;
