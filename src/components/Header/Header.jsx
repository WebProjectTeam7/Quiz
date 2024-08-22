import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/app.context';
import { logoutUser } from '../../services/auth.service';
import './Header.css';
import Swal from 'sweetalert2';

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
            {userData && <span>Welcome, {userData.username}</span>}
            <nav>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/quizzes">Quizzes</NavLink>
                <NavLink to="/ranking">Ranking</NavLink>
                <NavLink to="/tournament">Tournament</NavLink>
                {user && <NavLink to="/my-profile">My Profile</NavLink>}
                <NavLink to="organizer-dashboard">Organizer Dashboard</NavLink>
                {user && <button onClick={logout}>Logout</button>}
            </nav>
        </header>
    );
}
