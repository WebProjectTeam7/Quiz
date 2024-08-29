import { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/user.service';
import { banUser, deleteReportedBugs, getAllBannedUsers, getAllReportedBugs, unbanUser } from '../../services/admin.service';
import UserRoleEnum from '../../common/role-enum';
import { Box, Button, Input, Table, Tbody, Td, Th, Thead, Tr, Text, Badge } from '@chakra-ui/react';
import Swal from 'sweetalert2';
import useModal from '../../custom-hooks/useModal';
import UserProfileModal from '../../components/UserProfileModal/UserProfileModal';
import Pagination from '../../components/Pagination/Pagination';
import { Link } from 'react-router-dom';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [view, setView] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const { isModalVisible, openModal, closeModal } = useModal();
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [bannedUsers, setBannedUsers] = useState([]);

    useEffect(() => {
        fetchAllUsers();
        fetchBannedUsers();
        fetchReportedBugs();
    }, []);

    const fetchAllUsers = async () => {
        try {
            const users = await getAllUsers();
            const banned = await getAllBannedUsers();

            const usersWithBanStatus = users.map(user => ({
                ...user,
                banned: banned.some(bannedUser => bannedUser.uid === user.uid),
            }));

            setUsers(usersWithBanStatus);
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchBannedUsers = async () => {
        try {
            const banned = await getAllBannedUsers();
            setBannedUsers(banned);
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleBanUser = async (user) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to ban this user?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, ban it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            try {
                await banUser(user.uid, user.username, user.email);
                Swal.fire('Banned!', 'User banned successfully.', 'success');
                setUsers(users.map(u => u.uid === user.uid ? { ...u, banned: true } : u));
                setBannedUsers([...bannedUsers, user]);
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    const handleUnbanUser = async (uid) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to unban this user?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, unban it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            try {
                await unbanUser(uid);
                Swal.fire('Unbanned!', 'User unbanned successfully.', 'success');
                const unbannedUser = bannedUsers.find(user => user.uid === uid);
                setBannedUsers(bannedUsers.filter(user => user.uid !== uid));
                if (unbannedUser) {
                    setUsers(users.map(u => u.uid === uid ? { ...u, banned: false } : u));
                }
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    const handleBanUnbanUpdate = (updatedUser) => {
        setUsers(users.map(user => user.uid === updatedUser.uid ? updatedUser : user));

        if (updatedUser.banned) {
            setBannedUsers([...bannedUsers, updatedUser]);
        } else {
            setBannedUsers(bannedUsers.filter(user => user.uid !== updatedUser.uid));
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

    const fetchReportedBugs = async () => {
        try {
            const bugs = await getAllReportedBugs();
            setReports(bugs);
        } catch (error) {
            console.error(error.message);
        }
    };


    const filteredUsers = (view === 'banned' ? bannedUsers : users).filter(user =>
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
                <Button onClick={() => setView('banned')} mr={2}>Banned Users</Button>
                <Button onClick={() => setView('reports')}>Bug Reports</Button>
            </Box>
            <Input
                placeholder="Search by username, email, or name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                mb={4}
            />
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
                                        {view === 'banned' ? (
                                            <Button colorScheme="green" onClick={() => handleUnbanUser(user.uid)}>Unban</Button>
                                        ) : (
                                            user.banned ? (
                                                <Button colorScheme="green" onClick={() => handleUnbanUser(user.uid)}>Unban</Button>
                                            ) : (
                                                <Button colorScheme="yellow" onClick={() => handleBanUser(user)}>Ban</Button>
                                            )
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
            )}
            {view === 'reports' && (
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Reported Question</Th>
                            <Th>Reported By</Th>
                            <Th>Reason</Th>
                            <Th>Time</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {reports.length > 0 ? (
                            reports.map(report => (
                                <Tr key={report.id}>
                                    <Td>
                                        <Link to={`/quiz-preview/${report.quizId}?highlight=${report.questionId}`}>
                                            View Quiz
                                        </Link>
                                    </Td>
                                    <Td>{report.reportedBy}</Td>
                                    <Td>{report.reason}</Td>
                                    <Td>{new Date(report.reportedAt).toLocaleString()}</Td>
                                    <Td>
                                        <Button colorScheme="red" onClick={() => handleDeleteReport(report.id)}>
                                            Resolved
                                        </Button>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="5">No reports available</Td>
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
                    onBanUnban={handleBanUnbanUpdate}
                />
            )}
        </Box>
    );
}