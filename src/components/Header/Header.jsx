import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/app.context';
import { logoutUser } from '../../services/auth.service';
import MyProfile from '../../views/MyProfile/MyProfile';
import './Header.css';


export default function Header() {
    const { user, userData, setAppState } = useContext(AppContext);
    const navigate = useNavigate();


    const logout = async () => {
        await logoutUser();
        setAppState({ user: null, userData: null });
        navigate('/login');
    };


    return (
        <header className="site-header">
            <h1>Bee Champion</h1>
            {userData && <span>Welcome, {userData.username}</span>}
            <nav>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/quizzes">Quizzes</NavLink>
                <NavLink to="/my-profile">My Profile</NavLink>
                <NavLink to="/my-profile" element={<MyProfile />} />
                {user && <button onClick={logout}>Logout</button>}
            </nav>
        </header>
    );
}
