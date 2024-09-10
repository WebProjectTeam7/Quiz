import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { useContext } from 'react';
import { AppContext } from '../../state/app.context';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/auth.service';
import { Button, Box, Icon, Badge, HStack } from '@chakra-ui/react';
import { FiBell } from 'react-icons/fi';
import { FaHome, FaUserAlt, FaList, FaGamepad, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { MdQuiz } from 'react-icons/md';
import NotificationList from '../../components/NotificationList/NotificationList';
import useModal from '../../custom-hooks/useModal';
import UserRoleEnum from '../../common/role-enum';
import useNotifications from '../../custom-hooks/UseNotifications';
import './Header.css';

export default function Header({ registrationModal, loginModal }) {
    const { user, userData, setAppState } = useContext(AppContext);
    const navigate = useNavigate();
    const { newNotifications } = useNotifications();

    const {
        isModalVisible: isNotificationModalOpen,
        openModal: openNotificationModal,
        closeModal: closeNotificationModal,
    } = useModal();

    const logout = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will be logged out of your account.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, log me out!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            await logoutUser(user.uid);
            setAppState({ user: null, userData: null });
            navigate('/');
        }
    };

    return (
        <header className="site-header">
            <nav>
                <div className="nav-buttons">
                    {/* Home Button */}
                    <button className="home-button-home-page" onClick={() => navigate('/')}>
                        <FaHome size="24px" />
                    </button>

                    {user && (
                        <Box position="relative" ml={4} cursor="pointer">
                            <Icon as={FiBell} boxSize={6} onClick={openNotificationModal} />
                            {newNotifications.length > 0 && (
                                <Badge
                                    colorScheme="red"
                                    position="absolute"
                                    top="-1"
                                    right="-3"
                                    px={2}
                                    py={1}
                                    fontSize="1.2em"
                                    sx={{
                                        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                                        backgroundColor: 'red.500',
                                        color: 'white',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: '30px',
                                        height: '25px',
                                    }}
                                >
                                    {newNotifications.length}
                                </Badge>
                            )}
                        </Box>
                    )}
                    {/* Welcome Text */}
                    {userData && <span className="welcome-text">Welcome, {userData.username}</span>}

                    {/* Navigation Buttons without Dropdown */}
                    <HStack spacing={4}>
                        <Button
                            as={NavLink}
                            to="/quiz-categories"
                            leftIcon={<Icon as={MdQuiz} />}
                            colorScheme="teal"
                            variant="outline"
                        >
                            Quizzes
                        </Button>
                        <Button
                            as={NavLink}
                            to="/ranking"
                            leftIcon={<Icon as={FaList} />}
                            colorScheme="teal"
                            variant="outline"
                        >
                            Ranking
                        </Button>
                        <Button
                            as={NavLink}
                            to="/quiz-battle-lobby"
                            leftIcon={<Icon as={FaGamepad} />}
                            colorScheme="teal"
                            variant="outline"
                        >
                            Quiz Battle
                        </Button>
                        {user && (
                            <Button
                                as={NavLink}
                                to="/my-profile"
                                leftIcon={<Icon as={FaUserAlt} />}
                                colorScheme="teal"
                                variant="outline"
                            >
                                My Profile
                            </Button>
                        )}
                        {(userData?.role === UserRoleEnum.ORGANIZER || userData?.role === UserRoleEnum.ADMIN) && (
                            <Button
                                as={NavLink}
                                to="/organizer-dashboard"
                                colorScheme="teal"
                                variant="outline"
                            >
                                Organizer Dashboard
                            </Button>
                        )}
                        {userData?.role === UserRoleEnum.ADMIN && (
                            <Button
                                as={NavLink}
                                to="/admin"
                                colorScheme="red"
                                variant="outline"
                            >
                                Admin Dashboard
                            </Button>
                        )}
                        {user && (
                            <Button
                                onClick={logout}
                                colorScheme="teal"
                                size="lg"
                                leftIcon={<FaSignInAlt />}
                                variant="solid"
                                _hover={{ bg: 'teal.600' }}
                            >
                                Logout
                            </Button>
                        )}
                    </HStack>

                    {/* Auth Buttons */}
                    {!user && (
                        <div className="auth-buttons">
                            <Button
                                onClick={registrationModal.openModal}
                                colorScheme="teal"
                                size="lg"
                                leftIcon={<FaUserPlus />}
                                variant="solid"
                                _hover={{ bg: 'teal.600' }}
                            >
                                Register
                            </Button>
                            <Button
                                onClick={loginModal.openModal}
                                colorScheme="teal"
                                size="lg"
                                leftIcon={<FaSignInAlt />}
                                variant="solid"
                                _hover={{ bg: 'teal.600' }}
                            >
                                Login
                            </Button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Notification Modal */}
            <NotificationList
                isOpen={isNotificationModalOpen}
                onClose={closeNotificationModal}
            />
        </header>
    );
}

Header.propTypes = {
    registrationModal: PropTypes.shape({
        openModal: PropTypes.func.isRequired,
        closeModal: PropTypes.func.isRequired,
        isModalVisible: PropTypes.bool.isRequired,
    }).isRequired,
    loginModal: PropTypes.shape({
        openModal: PropTypes.func.isRequired,
        closeModal: PropTypes.func.isRequired,
        isModalVisible: PropTypes.bool.isRequired,
    }).isRequired,
};
