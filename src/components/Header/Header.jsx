import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/app.context';
import { logoutUser } from '../../services/auth.service';
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
        <header>
            <h1>Bee Champion</h1>
            {userData && <span>Welcome, {userData.username}</span>}
            <nav>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/quizzes">Quizzes</NavLink>
            </nav>
        </header>
    );
}
