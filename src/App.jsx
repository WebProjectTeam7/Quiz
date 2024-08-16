import { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppContext } from './state/app.context';
import { auth } from './config/firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getUserData } from './services/user.service';
import Header from './components/Header/Header';
import Home from './views/Home/Home';
import NotFound from './views/NotFound/NotFound';
import Quizzes from './views/Quizzes/Quizzes';
import QuizOfTheWeek from './views/QuizOfTheWeek/QuizOfTheWeek';
import QuizOfTheWeekDetail from './views/QuizOfTheWeekDetail/QuizOfTheWeekDetail';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    const [appState, setAppState] = useState({
        user: null,
        userData: null,
    });
    const [user, loading, error] = useAuthState(auth);
    const [searchQuery, setSearchQuery] = useState('');

    if (appState.user !== user) {
        setAppState({ ...appState, user });
    }

    useEffect(() => {
        if (!user) return;
        getUserData(appState.user.uid)
            .then((data) => {
                const userData = data[Object.keys(data)[0]];
                setAppState({ ...appState, userData });
            })
            .catch((e) => {
                console.error(e.message);
            });
    }, [user]);

    return (
        <BrowserRouter>
            <AppContext.Provider
                value={{ ...appState, setAppState, searchQuery, setSearchQuery }}
            >
                <Header />
                <Routes>
                    <Route path="/quizzes" element={<Quizzes />} />
                    <Route path="/quiz-of-the-week" element={<QuizOfTheWeek />} />
                    <Route path="/quiz-of-the-week-detail" element={<QuizOfTheWeekDetail />} />
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <footer>&copy;Team7Forum</footer>
            </AppContext.Provider>
        </BrowserRouter >
    );
}
