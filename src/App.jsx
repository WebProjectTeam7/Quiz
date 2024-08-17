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
import useModal from './custum-hooks/useModal';
import RegistrationModal from './components/RegistrationModal/RegistrationModal';
import LoginModal from './components/LoginModal/LoginModal';
import { ChakraProvider, Button } from '@chakra-ui/react';
import QuizOfTheWeek from './views/QuizOfTheWeek/QuizOfTheWeek';
import QuizOfTheWeekDetail from './views/QuizOfTheWeekDetail/QuizOfTheWeekDetail';
import Quizzes from './views/Quizzes/Quizzes';

export default function App() {
    const [appState, setAppState] = useState({
        user: null,
        userData: null,
    });
    const [user, loading, error] = useAuthState(auth);
    const [searchQuery, setSearchQuery] = useState('');

    const registrationModal = useModal();
    const loginModal = useModal();

    useEffect(() => {
        if (appState.user !== user) {
            setAppState({ ...appState, user });
        }
    }, [user, appState.user]);

    useEffect(() => {
        if (!user) {
            setAppState((prevState) => ({ ...prevState, userData: null }));
            return;
        }

        getUserData(user.uid)
            .then((data) => {
                const userData = data[Object.keys(data)[0]];
                setAppState({ ...appState, userData });
            })
            .catch((e) => {
                console.error(e.message);
            });
    }, [user]);

    return (
        <ChakraProvider>
            <BrowserRouter>
                <AppContext.Provider
                    value={{ ...appState, setAppState, searchQuery, setSearchQuery }}
                >
                    <Header />
                    <div className="main-content">
                        <Button onClick={registrationModal.openModal} colorScheme="teal" m={2}>
                            Register
                        </Button>
                        <Button onClick={loginModal.openModal} colorScheme="teal" m={2}>
                            Login
                        </Button>

                        <RegistrationModal isVisible={registrationModal.isModalVisible} onClose={registrationModal.closeModal} />
                        <LoginModal isVisible={loginModal.isModalVisible} onClose={loginModal.closeModal} />

                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/quizzes" element={<Quizzes />} />
                            <Route path="/quiz-of-the-week" element={<QuizOfTheWeek />} />
                            <Route path="/quiz-of-the-week-detail" element={<QuizOfTheWeekDetail />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </div>
                    <footer>&copy;Team7Forum</footer>
                </AppContext.Provider>
            </BrowserRouter>
        </ChakraProvider>
    );
}
