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
    HStack,
} from '@chakra-ui/react';
import { AppContext } from '../../state/app.context';
import CreateQuizModal from '../../components/CreateQuiz/CreateQuiz';
import CreateOrganizationModal from '../../components/CreateOrganization/CreateOrganizationModal';
import { getQuizzesByAuthor, getQuizzesByOrganizationId } from '../../services/quiz.service';
import './OrganizerDashboard.css';
// import { createOrganization, joinOrganization, leaveOrganization } from '../../services/organization.service';

export default function OrganizerDashboard() {
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();

    const {
        isOpen: isQuizModalOpen,
        onOpen: onQuizModalOpen,
        onClose: onQuizModalClose,
    } = useDisclosure();

    const {
        isOpen: isOrganizationModalOpen,
        onOpen: onOrganizationModalOpen,
        onClose: onOrganizationModalClose,
    } = useDisclosure();

    const [quizzes, setQuizzes] = useState([]);
    const [organization, setOrganization] = useState(null);

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

    const handleCreateOrganization = async () => {
        try {
            // const newOrg = await createOrganization({ name: "New Organization" });
            // setUserData({ ...userData, organizationId: newOrg.id });
        } catch (error) {
            console.error('Error creating organization:', error);
        }
    };

    const handleJoinOrganization = async () => {
        try {
            // await joinOrganization(orgId, userData.id);
            // setUserData({ ...userData, organizationId: orgId });
        } catch (error) {
            console.error('Error joining organization:', error);
        }
    };

    const handleLeaveOrganization = async () => {
        try {
            // await leaveOrganization(userData.organizationId, userData.id);
            // setUserData({ ...userData, organizationId: null });
        } catch (error) {
            console.error('Error leaving organization:', error);
        }
    };

    const handleOrganizationCreated = (newOrg) => {
        setOrganization(newOrg);
    };

    return (
        <Box className="organizer-dashboard-container" maxW="1200px" mx="auto" py={8} px={4}>
            <VStack spacing={4} align="start">
                <Heading as="h2" size="lg">
                    Organizer Dashboard
                </Heading>
                <HStack>
                    <Button colorScheme="blue" onClick={onQuizModalOpen}>
                        Create New Quiz
                    </Button>

                    {userData && userData.organizationId ? (
                        <>
                            <Button colorScheme="red" onClick={handleLeaveOrganization}>
                                Leave Organization
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button colorScheme="green" onClick={onOrganizationModalOpen}>
                                Create Organization
                            </Button>
                            <Button colorScheme="blue" onClick={handleJoinOrganization}>
                                Join Organization
                            </Button>

                        </>
                    )}
                </HStack>

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
                username={userData?.username}
                isOpen={isQuizModalOpen}
                onClose={onQuizModalClose}
            />
            <CreateOrganizationModal
                isOpen={isOrganizationModalOpen}
                onClose={onOrganizationModalClose}
                username={userData?.username}
                onOrganizationCreated={handleOrganizationCreated}
            />
        </Box>
    );
}
