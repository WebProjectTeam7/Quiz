import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkIfQuizCompleted, fetchQuizSummary, getQuizOfTheWeek } from '../../services/quiz.service';
import StartQuizModal from '../../components/StartQuizModal/StartQuizModal';
import { useContext } from 'react';
import { AppContext } from '../../state/app.context';
import './QuizOfTheWeek.css';

export default function QuizOfTheWeek() {
    const navigate = useNavigate();
    const { userData } = useContext(AppContext);
    const [quiz, setQuiz] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [quizSummary, setQuizSummary] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);

    const fetchQuizOfTheWeek = async () => {
        try {
            const fetchedQuiz = await getQuizOfTheWeek();
            if (fetchedQuiz) {
                setQuiz(fetchedQuiz);
                const completed = await checkIfQuizCompleted(fetchedQuiz.id, userData.username);
                setIsCompleted(completed);
                if (completed) {
                    const summary = await fetchQuizSummary(fetchedQuiz.id, userData.username);
                    setQuizSummary(summary);
                }
                setModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching quiz of the week:', error);
        }
    };

    useEffect(() => {
        fetchQuizOfTheWeek();
    }, []);

    return (
        <div className="quiz-of-the-week-container">
            {quiz && (
                <StartQuizModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    quiz={{ ...quiz, isCompleted, summary: quizSummary }}
                />
            )}
            <button className="back-button" onClick={() => navigate('/quiz-categories')}>
                Back
            </button>
        </div>
    );
}
