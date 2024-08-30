import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Input,
    Button,
    Th,
    Table,
    Thead,
    Tr,
    Tbody,
    Td,
    Badge,
    Box,
    InputGroup,
    InputLeftElement,
    Icon
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useModal from '../../custom-hooks/useModal';
import UserProfileModal from '../../components/UserProfileModal/UserProfileModal';
import Pagination from '../../components/Pagination/Pagination';
import { getAllUsers } from '../../services/user.service';
import UserRoleEnum from '../../common/role-enum';
import { SearchIcon } from '@chakra-ui/icons';
import InvitationEnum from '../../common/invitation-enum';

const SendInvitationModal = ({ isOpen, onClose, objId, objType }) => {
    const [users, setUsers] = useState([]);
    const [view, setView] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const { isModalVisible, openModal, closeModal } = useModal();
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        try {
            const users = await getAllUsers();
            setUsers(users);
        } catch (error) {
            console.error(error.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleOpenProfile = (user) => {
        setSelectedUser(user);
        openModal();
    };

    const handleInviteUser = (user) => {
        if (objType === InvitationEnum.ORGANIZATION) {
            // TODO
        } else if (objType === InvitationEnum.QUIZ) {
            // TODO
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent maxW="fit-content" width="auto">
                <ModalHeader>Send Invitation</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box p={4}>
                        <InputGroup mb={4}>
                            <InputLeftElement pointerEvents="none">
                                <Icon as={SearchIcon} color="gray.300" />
                            </InputLeftElement>
                            <Input
                                placeholder="Search by username, email, or name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                maxW='350px'
                            />
                        </InputGroup>
                        {(view === 'all' || view === 'banned') && (
                            <>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Username</Th>
                                            <Th>Email</Th>
                                            <Th>First Name</Th>
                                            <Th>Last Name</Th>
                                            <Th>Details</Th>
                                            <Th></Th>
                                            <Th></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {currentUsers.map(user => (
                                            <Tr key={user.uid}>
                                                <Td>
                                                    {user.username}{' '}
                                                    {user.role && (
                                                        <Badge
                                                            colorScheme={user.role === UserRoleEnum.ADMIN ? 'red' : user.role === UserRoleEnum.ORGANIZER ? 'orange' : 'blue'}
                                                            fontSize="0.6em"
                                                        >
                                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                        </Badge>
                                                    )}
                                                </Td>
                                                <Td>{user.email}</Td>
                                                <Td>{user.firstName}</Td>
                                                <Td>{user.lastName}</Td>
                                                <Td>
                                                    <Button onClick={() => handleOpenProfile(user)}>Profile</Button>
                                                </Td>
                                                <Td>
                                                    <Button onClick={() => handleInviteUser(user)}>Invite</Button>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                        {selectedUser && (
                            <UserProfileModal
                                isOpen={isModalVisible}
                                onClose={closeModal}
                                username={selectedUser.username}
                            />
                        )}
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SendInvitationModal;
