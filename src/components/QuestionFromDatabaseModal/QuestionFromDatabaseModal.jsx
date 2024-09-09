import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Select, VStack, Box, Text, Button } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { getQuestionsByCategoryAndOrganization } from '../../services/question.service';
import './QuestionFromDatabaseModal.css';
import Pagination from '../Pagination/Pagination';
import { SMALL_PAGE } from '../../common/components.constants';

export default function QuestionsFromDatabaseModal({ isOpen, onClose, onAddQuestion, categories, organizationId, currentUsername }) {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(questions.length / SMALL_PAGE);

    const fetchQuestions = async () => {
        try {
            const fetchedQuestions = await getQuestionsByCategoryAndOrganization(selectedCategory, organizationId, currentUsername);
            setQuestions(fetchedQuestions);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        }
    };

    useEffect(() => {
        setQuestions([]);
        setCurrentPage(1);
        if (selectedCategory) {
            fetchQuestions();
        }
    }, [selectedCategory]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * SMALL_PAGE;
    const currentQuestions = questions.slice(startIndex, startIndex + SMALL_PAGE);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Questions from Database</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Select
                        placeholder="Select Category"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        value={selectedCategory}
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </Select>

                    <VStack mt={4} spacing={4}>
                        {currentQuestions .length > 0 ? (
                            currentQuestions .map((question) => (
                                <Box
                                    key={question.id}
                                    borderWidth={1}
                                    borderRadius="md"
                                    p={4}
                                    w="100%"
                                    bg="gray.50"
                                    shadow="sm"
                                >
                                    <Text fontWeight="bold" fontSize="lg" color="green.600" mb={2}>{question.title}</Text>
                                    <Text fontSize="md" mb={2} color="yellow.600">Description: {question.description}</Text>
                                    <Text fontSize="sm" color="purple.500">Author: {question.author}</Text>
                                    <Button
                                        colorScheme="teal"
                                        onClick={() => onAddQuestion(question.id)}
                                        size="sm"
                                        mt={3}
                                    >
                                        Add
                                    </Button>
                                </Box>
                            ))
                        ) : (
                            <Text>No questions found for the selected category.</Text>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    {questions.length > SMALL_PAGE && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalQuestions={questions.length}
                            questionsPerPage={SMALL_PAGE}
                        />
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

QuestionsFromDatabaseModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAddQuestion: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    organizationId: PropTypes.string.isRequired,
    currentUsername: PropTypes.string.isRequired,
};
