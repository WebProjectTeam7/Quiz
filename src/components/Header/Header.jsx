import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/app.context';
import { logoutUser } from '../../services/auth.service';
import './Header.css';
import Swal from 'sweetalert2';
import { Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

export default function Header() {
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
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} className="chakra-menu__menu-button">
                        Actions
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
            </nav>
        </header>
    );
}
