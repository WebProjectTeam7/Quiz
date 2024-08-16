// src/pages/QuizOfTheWeek.js
import { useNavigate } from 'react-router-dom';
import Hexagon from '../../components/Hexagon/Hexagon';
import './QuizOfTheWeek.css';

export default function QuizOfTheWeek() {
    const navigate = useNavigate();

    return (
        <div className="quiz-of-the-week-container">
            <div className="hexagon-grid">
                <Hexagon className="hexagon easy" level="easy" userId="special" onClick={() => navigate('/quiz-of-the-week-detail')} />
                <Hexagon className="hexagon medium" level="medium" userId="special" onClick={() => navigate('/quiz-of-the-week-detail')} />
                <Hexagon className="hexagon hard" level="hard" userId="special" onClick={() => navigate('/quiz-of-the-week-detail')} />
            </div>
            <button className="back-button" onClick={() => navigate('/quizzes')}>
                Back
            </button>
        </div>
    );
}
