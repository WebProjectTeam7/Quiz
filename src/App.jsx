import { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppContext } from './state/app.context';
import { auth } from './config/firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getUserData, monitorUserStatus } from './services/user.service';
import Header from './components/Header/Header';
import Home from './views/Home/Home';
import NotFound from './views/NotFound/NotFound';
import RegistrationModal from './components/RegistrationModal/RegistrationModal';
import LoginModal from './components/LoginModal/LoginModal';
import { ChakraProvider } from '@chakra-ui/react';
import QuizOfTheWeek from './views/QuizOfTheWeek/QuizOfTheWeek';
import QuizOfTheWeekDetail from './views/QuizOfTheWeekDetail/QuizOfTheWeekDetail';
import Quizzes from './views/Quizzes/Quizzes';
import MyProfile from './views/MyProfile/MyProfile';
import QuizPreview from './views/QuizPreview/QuizPreview';
import Ranking from './views/Ranking/Ranking';
import OrganizerDashboard from './views/OrganizerDashboard/OrganizerDashboard';
import Tournament from './views/Tournament/Tournament';
import useModal from './custom-hooks/useModal';
import PlayQuiz from './views/PlayQuiz/PlayQuiz';
import AdminPage from './views/AdminPage/AdminPage';
import SampleQuiz from './views/SampleQuiz/SampleQuiz';
import QuizCategories from './views/QuizCategories/QuizCategories';
import QuizSummary from './views/QuizSummary/QuizSummary';

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
            setAppState((prevState) => ({ ...prevState, user }));
        }
    }, [user, appState.user]);

    useEffect(() => {
        if (!user) return;
        if (!appState.user) return;
        getUserData(appState.user.uid)
            .then((data) => {
                const userData = data;
                setAppState({ ...appState, userData });
            })
            .catch((e) => {
                console.error(e.message);
            });
    }, [user, appState.user]);

    useEffect(() => {
        if (user) {
            getUserData(user.uid)
                .then((data) => {
                    setAppState((prevState) => ({
                        ...prevState,
                        user,
                        userData: data,
                    }));
                    monitorUserStatus(user.uid);
                })
                .catch((e) => {
                    console.error('Error fetching user data:', e);
                });
        }
    }, [user]);

    return (
        <ChakraProvider>
            <BrowserRouter>
                <AppContext.Provider value={{ ...appState, setAppState, searchQuery, setSearchQuery }}>
                    <Header
                        registrationModal={registrationModal}
                        loginModal={loginModal}
                    />
                    <div className="main-content">
                        <RegistrationModal
                            isVisible={registrationModal.isModalVisible}
                            onClose={registrationModal.closeModal}
                        />
                        <LoginModal
                            isVisible={loginModal.isModalVisible}
                            onClose={loginModal.closeModal}
                            openRegisterModal={registrationModal.openModal}
                        />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/sample-quiz" element={<SampleQuiz />} />
                            <Route path="/quizzes" element={<Quizzes />} />
                            <Route path="/my-profile" element={<MyProfile />} />
                            <Route path="/quiz-of-the-week" element={<QuizOfTheWeek />} />
                            <Route path="/quiz-of-the-week-detail" element={<QuizOfTheWeekDetail />} />
                            <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
                            <Route path="/quiz-preview/:quizId" element={<QuizPreview />} />
                            <Route path="/quiz-categories" element={<QuizCategories />} />
                            <Route path="/ranking" element={<Ranking />} />
                            <Route path="/tournament" element={<Tournament />} />
                            <Route path="/play-quiz/:quizId" element={<PlayQuiz />} />
                            <Route path="/quiz-summary" element={<QuizSummary />} />
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </div>
                    <footer>&copy;Team7Forum</footer>
                </AppContext.Provider>
            </BrowserRouter>
        </ChakraProvider>
    );
}
