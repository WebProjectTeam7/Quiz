import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { useContext } from 'react';
import { AppContext } from '../../state/app.context';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/auth.service';
import { Menu, MenuButton, MenuList, MenuItem, Button, Box, Icon, Badge } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FiBell } from 'react-icons/fi';
import { FaHome } from 'react-icons/fa';
import UserRoleEnum from '../../common/role-enum';
import useNotifications from '../../custom-hooks/UseNotifications';
import './Header.css';


export default function Header({ registrationModal, loginModal }) {
    const { user, userData, setAppState } = useContext(AppContext);
    const navigate = useNavigate();
    const notifications = useNotifications();

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
                    <button className="home-button-home-page" onClick={() => navigate('/')}>
                        <FaHome size="24px" />
                    </button>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} className="chakra-menu__menu-button">
                            MENU
                        </MenuButton>
                        <MenuList className="chakra-menu__menu-list">
                            <MenuItem as={NavLink} to="/quiz-categories">Quizzes</MenuItem>
                            <MenuItem as={NavLink} to="/ranking">Ranking</MenuItem>
                            <MenuItem as={NavLink} to="/tournament">Quiz Battle</MenuItem>
                            {user && <MenuItem as={NavLink} to="/my-profile">My Profile</MenuItem>}
                            <MenuItem as={NavLink} to="/organizer-dashboard">Organizer Dashboard</MenuItem>
                            {userData?.role === UserRoleEnum.ADMIN && (
                                <MenuItem as={NavLink} to="/admin">Admin Dashboard</MenuItem>
                            )}
                            {user && <MenuItem onClick={logout}>Logout</MenuItem>}
                        </MenuList>
                    </Menu>

                    {userData && <span className="welcome-text">Welcome, {userData.username}</span>}

                    <Box position="relative" ml={4} cursor="pointer">
                        <Icon as={FiBell} boxSize={6} onClick={() => navigate('/notifications')} />
                        {notifications.length > 0 && (
                            <Badge
                                colorScheme="red"
                                position="absolute"
                                top="-1"
                                right="-3"
                                px={2}
                                py={1}
                                fontSize="0.75em"
                                sx={{
                                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', // Hexagon shape
                                    backgroundColor: 'red.500',
                                    color: 'white',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '30px',
                                    height: '25px',
                                }}
                            >
                                {notifications.length}
                            </Badge>
                        )}
                    </Box>


                    {!user && (
                        <div className="auth-buttons">
                            <Button onClick={registrationModal.openModal} colorScheme="teal" m={2}>
                                Register
                            </Button>
                            <Button onClick={loginModal.openModal} colorScheme="teal" m={2}>
                                Login
                            </Button>
                        </div>
                    )}
                </div>
            </nav>
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
