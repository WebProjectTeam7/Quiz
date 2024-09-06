import PropTypes from 'prop-types';
import './StartQuizModal.css';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Flex, Badge, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function StartQuizModal({ isOpen, onClose, quiz }) { 
    const navigate = useNavigate();

    if (!quiz) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent className="modal-content">
                <ModalHeader>{quiz.title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex direction="column" gap={4}>
                        <Badge colorScheme="blue">Author: {quiz.author}</Badge>
                        <Badge colorScheme="orange">Difficulty: {quiz.difficulty}</Badge>
                        <Badge colorScheme="teal">Time Limit: {quiz.timeLimit} mins</Badge>
                        <Badge colorScheme="yellow">Total Points: {quiz.totalPoints}</Badge>
                        <Text mt={2}>{quiz.description}</Text>
                    </Flex>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" onClick={() => navigate(`/play-quiz/${quiz.id}`)}>
                        Start Quiz
                    </Button>
                    <Button variant="ghost" onClick={onClose} ml={3}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

StartQuizModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    quiz: PropTypes.shape({
        title: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        difficulty: PropTypes.string.isRequired,
        timeLimit: PropTypes.number.isRequired,
        totalPoints: PropTypes.number.isRequired,
        description: PropTypes.string,
        id: PropTypes.string.isRequired
    }).isRequired,
};
