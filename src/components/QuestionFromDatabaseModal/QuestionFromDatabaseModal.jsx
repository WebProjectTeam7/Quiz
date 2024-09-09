import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Select, VStack, Box, Text, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { getQuestionsByCategoryAndOrganization } from '../../services/question.service';

export default function QuestionsFromDatabaseModal({ isOpen, onClose, onAddQuestion, categories, organizationId, currentUsername }) {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [questions, setQuestions] = useState([]);

    const fetchQuestions = async () => {
        try {
            const fetchedQuestions = await getQuestionsByCategoryAndOrganization(selectedCategory, organizationId, currentUsername);
            console.log('Fetched questions:', fetchedQuestions);
            setQuestions(fetchedQuestions); 
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        }
    };

    useEffect(() => {
        if (selectedCategory) {
            fetchQuestions();
        }
    }, [selectedCategory]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Questions from Database</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Select placeholder="Select Category" onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </Select>
                    <VStack mt={4} spacing={4}>
                        {questions.length > 0 ? (
                            questions.map((question) => (
                                <Box key={question.id} borderWidth={1} p={4} borderRadius="md">
                                    <Text>{question.title}</Text>
                                    <Button colorScheme="teal" onClick={() => onAddQuestion(question.id)}>Add</Button>
                                </Box>
                            ))
                        ) : (
                            <Text>No questions found for the selected category.</Text>
                        )}
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
