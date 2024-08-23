import PropTypes from 'prop-types';
import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/app.context';
import { logoutUser } from '../../services/auth.service';
import Swal from 'sweetalert2';
import './Header.css';
import { Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FaHome } from 'react-icons/fa';

export default function Header({ registrationModal, loginModal }) {
    const { user, userData, setAppState } = useContext(AppContext);
    const navigate = useNavigate();

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
            navigate('/login');
        }
    };

    return (
        <header className="site-header">
            <h1>Bee Champion</h1>
            {userData && <span className="welcome-text">Welcome, {userData.username}</span>}
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
                            <MenuItem as={NavLink} to="/quizzes">Quizzes</MenuItem>
                            <MenuItem as={NavLink} to="/ranking">Ranking</MenuItem>
                            <MenuItem as={NavLink} to="/tournament">Quiz Battle</MenuItem>
                            {user && <MenuItem as={NavLink} to="/my-profile">My Profile</MenuItem>}
                            <MenuItem as={NavLink} to="/organizer-dashboard">Organizer Dashboard</MenuItem>
                            {user && <MenuItem onClick={logout}>Logout</MenuItem>}
                        </MenuList>
                    </Menu>
                </div>
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
