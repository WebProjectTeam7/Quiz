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
import Swal from 'sweetalert2';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/app.context';
import { getQuizzesByAuthor, getQuizzesByOrganizationId } from '../../services/quiz.service';
import { joinOrganization, leaveOrganization, getOrganizationById } from '../../services/organization.service';
import CreateQuizModal from '../../components/CreateQuiz/CreateQuiz';
import CreateOrganizationModal from '../../components/CreateOrganizationModal/CreateOrganizationModal';
import SendInvitationModal from '../../components/SendInvitationModal/SendInvitationModal';
import NotificationEnum from '../../common/notification-enum';
import './OrganizerDashboard.css';

export default function OrganizerDashboard() {
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();
    const {
        isOpen: isQuizModalOpen,
        onOpen: onQuizModalOpen,
        onClose: onQuizModalClose,
    } = useDisclosure();

    const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();

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
            if (userData.organizationId) {
                fetchOrganizationDetails(userData.organizationId);
            }
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

    const fetchOrganizationDetails = async (orgId) => {
        try {
            const organization = await getOrganizationById(orgId);
            setOrganization(organization);
        } catch (error) {
            console.error('Failed to fetch organization details:', error);
        }
    };

    const handleQuizClick = (quizId) => {
        navigate(`/quiz-preview/${quizId}`);
    };

    const handleJoinOrganization = async (orgId) => {
        try {
            await joinOrganization(orgId, userData.id);
            userData.organizationId = orgId;
            fetchOrganizationDetails(orgId);
        } catch (error) {
            console.error('Error joining organization:', error);
        }
    };

    const handleLeaveOrganization = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this action!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, leave the organization!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                await leaveOrganization(userData.username);
                userData.organizationId = null;
                userData.organizationName = null;
                setOrganization(null);

                Swal.fire(
                    'Left!',
                    'You have successfully left the organization.',
                    'success'
                );
            } catch (error) {
                console.error('Error leaving organization:', error);

                Swal.fire(
                    'Error',
                    'There was an issue leaving the organization. Please try again later.',
                    'error'
                );
            }
        }
    };

    const handleOrganizationCreated = (newOrg) => {
        setOrganization(newOrg);
        userData.organizationId = newOrg.id;
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
                            <Button colorScheme="blue" onClick={onInviteOpen}>
                                Invite to Organization
                            </Button>
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
                        {organization ? `${organization.name}'s Quizzes` : 'My Quizzes'}
                    </Heading>
                    <Table variant="striped" colorScheme="teal">
                        <Thead>
                            <Tr>
                                <Th>Title</Th>
                                <Th>Description</Th>
                                <Th>Type</Th>
                                <Th>Author</Th>
                                <Th>Category</Th>
                                <Th>Created At</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {quizzes.map((quiz) => (
                                <Tr key={quiz.id}>
                                    <Td>{quiz.title}</Td>
                                    <Td>{quiz.description}</Td>
                                    <Td>{quiz.type}</Td>
                                    <Td>{quiz.author}</Td>
                                    <Td>{quiz.category}</Td>
                                    <Td>{new Date(quiz.createdAt).toLocaleDateString()}</Td>
                                    <Td>{quiz.isActive ? 'active' : 'inactive'}</Td>
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
                onOrganizationCreated={handleOrganizationCreated}
            />
            <SendInvitationModal
                isOpen={isInviteOpen}
                onClose={onInviteClose}
                objId={userData.organizationId}
                obj={organization}
                objType={NotificationEnum.INVITE_TO_ORGANIZATION}
            />
        </Box>
    );
}
