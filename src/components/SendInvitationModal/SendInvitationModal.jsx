import { SearchIcon } from '@chakra-ui/icons';
import { AppContext } from '../../state/app.context';
import { useContext, useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Button, Th, Table, Thead, Tr, Tbody, Td, Badge, Box, InputGroup, InputLeftElement, Icon } from '@chakra-ui/react';
import { sendNotificationToUser } from '../../services/notification.service';
import { inviteUserToPrivateQuiz, uninviteUserFromPrivateQuiz, getInvitedUsers } from '../../services/quiz.service';
import { leaveOrganization } from '../../services/organization.service';
import { getAllUsers } from '../../services/user.service';
import NotificationEnum from '../../common/notification-enum';
import UserRoleEnum from '../../common/role-enum';
import useModal from '../../custom-hooks/useModal';
import UserProfileModal from '../../components/UserProfileModal/UserProfileModal';
import Pagination from '../../components/Pagination/Pagination';
import PropTypes from 'prop-types';
import { NOTIFICATION_ORGANIZATION_INVITE, NOTIFICATION_ORGANIZATION_REMOVE, NOTIFICATION_QUIZ_INVITE, NOTIFICATION_QUIZ_UNINVITE } from '../../common/notification-messages';

const SendInvitationModal = ({ isOpen, onClose, objId, obj, objType }) => {
    const { userData } = useContext(AppContext);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const { isModalVisible, openModal, closeModal } = useModal();
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [invitedUsers, setInvitedUsers] = useState([]);

    useEffect(() => {
        fetchAllUsers();
        if (objType === NotificationEnum.INVITE_TO_QUIZ) {
            fetchInvitedUsers();
        }
    }, []);

    const fetchAllUsers = async () => {
        try {
            const users = await getAllUsers();
            setUsers(users);
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchInvitedUsers = async () => {
        try {
            const invited = await getInvitedUsers(objId);
            setInvitedUsers(invited);
        } catch (error) {
            console.error('Error fetching invited users:', error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.organizationName && user.organizationName.toLowerCase().includes(searchTerm.toLowerCase()))
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

    const handleInviteUninviteUser = async (user) => {
        if (objType === NotificationEnum.INVITE_TO_QUIZ) {

            if (invitedUsers.includes(user.username)) {
                await uninviteUserFromPrivateQuiz(objId, user.username);
                const notificationContent = NOTIFICATION_QUIZ_UNINVITE(obj.title);
                const notificationData = {
                    message: notificationContent,
                    type: NotificationEnum.TEXT,
                };
                await sendNotificationToUser(user.username, notificationData);
                setInvitedUsers(invitedUsers.filter((u) => u !== user.username));
            } else {
                await inviteUserToPrivateQuiz(objId, user.username);
                const notificationContent = NOTIFICATION_QUIZ_INVITE(userData.username, obj.title);
                const notificationData = {
                    message: notificationContent,
                    type: NotificationEnum.INVITE_TO_QUIZ,
                    quizId: obj.id,
                    quizTitle: obj.title,
                    quizCategory: obj.category,
                    quizDifficulty: obj.difficulty,
                    quizPoints: obj.totalPoints,
                    senderName: userData.username,
                };
                await sendNotificationToUser(user.username, notificationData);
                setInvitedUsers([...invitedUsers, user.username]);
            }
        } else if (objType === NotificationEnum.INVITE_TO_ORGANIZATION) {
            if (invitedUsers.includes(user.username)) {
                await leaveOrganization(objId, user.username);
                const notificationContent = NOTIFICATION_ORGANIZATION_REMOVE(userData.organizationName);
                const notificationData = {
                    message: notificationContent,
                    type: NotificationEnum.TEXT,
                };
                await sendNotificationToUser(user.username, notificationData);
                setInvitedUsers(invitedUsers.filter((u) => u !== user.username));
            } else {
                const notificationContent = NOTIFICATION_ORGANIZATION_INVITE(userData.organizationName);
                const notificationData = {
                    message: notificationContent,
                    type: NotificationEnum.INVITE_TO_ORGANIZATION,
                    organizationId: obj.id,
                    organizationName: obj.name,
                };
                await sendNotificationToUser(user.username, notificationData);
                setInvitedUsers([...invitedUsers, user.username]);
            }
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
                                placeholder="username, email, name or organization"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                maxW="350px"
                            />
                        </InputGroup>
                        <>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Username</Th>
                                        <Th>Email</Th>
                                        <Th>First Name</Th>
                                        <Th>Last Name</Th>
                                        <Th>Organization</Th>
                                        <Th>Details</Th>
                                        <Th>Invite Status</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {currentUsers.map((user) => (
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
                                            <Td>{user.organizationName || ''}</Td>
                                            <Td>
                                                <Button onClick={() => handleOpenProfile(user)}>Profile</Button>
                                            </Td>
                                            <Td>
                                                {objType === NotificationEnum.INVITE_TO_QUIZ ?
                                                    <Button
                                                        colorScheme={invitedUsers.includes(user.username) ? 'red' : 'blue'}
                                                        onClick={() => handleInviteUninviteUser(user)}
                                                    >
                                                        {invitedUsers.includes(user.username) ? 'Uninvite' : 'Invite'}
                                                    </Button>
                                                    :
                                                    !user.organizationId && (
                                                        <Button
                                                            colorScheme={invitedUsers.includes(user.username) ? 'red' : 'blue'}
                                                            onClick={() => handleInviteUninviteUser(user)}
                                                        >
                                                            {invitedUsers.includes(user.username) ? 'Remove' : 'Invite'}
                                                        </Button>
                                                    )}
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
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

SendInvitationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    objId: PropTypes.string.isRequired,
    obj: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        category: PropTypes.string,
        difficulty: PropTypes.string,
        totalPoints: PropTypes.number,
        name: PropTypes.string,
    }),
    objType: PropTypes.oneOf([NotificationEnum.INVITE_TO_ORGANIZATION, NotificationEnum.INVITE_TO_QUIZ]),
};

export default SendInvitationModal;
