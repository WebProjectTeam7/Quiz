/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Link,
    Heading,
    VStack,
    useDisclosure,
} from '@chakra-ui/react';
import { AppContext } from '../../state/app.context';
import CreateQuizModal from '../../components/CreateQuiz/CreateQuiz';
import { getQuizzesByAuthor, getQuizzesByOrganizationId } from '../../services/quiz.service';

export default function OrganizerDashboard() {
    const { userData } = useContext(AppContext);
    const [quizzes, setQuizzes] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();

    useEffect(() => {
        if (userData) {
            fetchQuizzes();
        }
    }, [userData]);

    const fetchQuizzes = async () => {
        try {
            let fetchedQuizzes = [];

            if (userData.organizationId) {
                const quizzesByOrg = await getQuizzesByOrganizationId(userData.organizationId);
                fetchedQuizzes = quizzesByOrg;
            }
            const quizzesByAuthor = await getQuizzesByAuthor(userData.username);
            fetchedQuizzes = [...fetchedQuizzes, ...quizzesByAuthor];

            const uniqueQuizzes = Array.from(
                new Map(fetchedQuizzes.map(quiz => [quiz.id, quiz])).values()
            );
            setQuizzes(uniqueQuizzes);
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
        }
    };

    const handleQuizClick = (quizId) => {
        navigate(`/quiz-preview/${quizId}`);
    };

    return (
        <Box maxW="1200px" mx="auto" py={8} px={4}>
            <VStack spacing={4} align="start">
                <Heading as="h2" size="lg">
                    Organizer Dashboard
                </Heading>
                <Button colorScheme="blue" onClick={onOpen}>
                    Create New Quiz
                </Button>

                <Box w="full" mt={8}>
                    <Heading as="h3" size="md" mb={4}>
                        My Organization's Quizzes
                    </Heading>
                    <Table variant="striped" colorScheme="teal">
                        <Thead>
                            <Tr>
                                <Th>Title</Th>
                                <Th>Description</Th>
                                <Th>Author</Th>
                                <Th>Category</Th>
                                <Th>Created At</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {quizzes.map((quiz) => (
                                <Tr key={quiz.id}>
                                    <Td>{quiz.title}</Td>
                                    <Td>{quiz.description}</Td>
                                    <Td>{quiz.author}</Td>
                                    <Td>{quiz.category}</Td>
                                    <Td>{new Date(quiz.createdAt).toLocaleDateString()}</Td>
                                    <Td>
                                        <Link
                                            color="teal.500"
                                            onClick={() => handleQuizClick(quiz.id)}
                                        >
                                            Preview
                                        </Link>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </VStack>

            <CreateQuizModal
                userId={userData?.id}
                isOpen={isOpen}
                onClose={onClose}
            />
        </Box>
    );
}
