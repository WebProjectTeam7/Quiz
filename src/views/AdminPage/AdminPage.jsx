import { useState, useEffect, useContext } from 'react';
import { getAllUsers } from '../../services/user.service';
import { deleteReportedBugs, deleteUser } from '../../services/admin.servce';
import { AppContext } from '../../state/app.context';
import UserRoleEnum from '../../common/role-enum';
import { Box, Button, Input, Table, Tbody, Td, Th, Thead, Tr, Text, Badge } from '@chakra-ui/react';
import Swal from 'sweetalert2';
import useModal from '../../custum-hooks/useModal';
import UserProfileModal from '../../components/UserProfileModal/UserProfileModal';
import Pagination from '../../components/Pagination/Pagination';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [view, setView] = useState('reports');
    const [searchTerm, setSearchTerm] = useState('');
    const { userData } = useContext(AppContext);
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

    const handleDeleteUser = async (uid, role) => {
        if (role === UserRoleEnum.ADMIN) {
            Swal.fire('Error', 'You cannot delete another admin.', 'error');
            return;
        }
        if (uid === userData.uid) {
            Swal.fire('Error', 'You cannot delete your own account.', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete this user? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            try {
                await deleteUser(uid);
                Swal.fire('Deleted!', 'User deleted successfully.', 'success');
                fetchAllUsers();
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    const handleDeleteReport = async (reportId) => {
        try {
            await deleteReportedBugs(reportId);
            setReports(reports.filter(report => report.id !== reportId));
            Swal.fire('Success', 'Report deleted successfully.', 'success');
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
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

    return (
        <Box p={4}>
            <Text fontSize="2xl" mb={4}>Admin Panel</Text>
            <Box mb={4}>
                <Button onClick={() => setView('all')} mr={2}>All Users</Button>
                <Button onClick={() => setView('reports')}>Bug Reports</Button>
            </Box>
            <Input
                placeholder="Search by username, email, or name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                mb={4}
            />
            {view === 'all' && (
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
                                        <Badge
                                            colorScheme={user.role === UserRoleEnum.ADMIN ? 'red' : user.role === UserRoleEnum.ORGANIZER ? 'orange' : 'blue'}
                                            fontSize="0.6em"
                                        >
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </Badge>
                                    </Td>
                                    <Td>{user.email}</Td>
                                    <Td>{user.firstName}</Td>
                                    <Td>{user.lastName}</Td>
                                    <Td>
                                        <Button onClick={() => handleOpenProfile(user)}>Profile</Button>
                                    </Td>
                                    <Td>
                                        <Button colorScheme="red" onClick={() => handleDeleteUser(user.uid, user.role)}>Delete</Button>
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
            {view === 'reports' && (
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Reported User</Th>
                            <Th>Reported By</Th>
                            <Th>Date</Th>
                            <Th>Type</Th>
                            <Th>Content</Th>
                            <Th>Reason</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {reports.length > 0 ? (
                            reports.map(report => (
                                <Tr key={report.id}>
                                    <Td>{report.reportedUser}</Td>
                                    <Td>{report.reporter}</Td>
                                    <Td>{new Date(report.reportedAt).toLocaleString()}</Td>
                                    <Td>{report.type}</Td>
                                    <Td>{report.content}</Td>
                                    <Td>{report.reason}</Td>
                                    <Td>
                                        <Button colorScheme="red" onClick={() => handleDeleteReport(report.id)}>Dismiss</Button>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="7">No reports available</Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            )}
            {selectedUser && (
                <UserProfileModal
                    isOpen={isModalVisible}
                    onClose={closeModal}
                    username={selectedUser.username}
                />
            )}
        </Box>
    );
}
