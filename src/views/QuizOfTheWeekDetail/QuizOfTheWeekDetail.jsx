import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Hexagon from '../../components/Hexagon/Hexagon';
import './QuizOfTheWeekDetail.css';

export default function QuizOfTheWeekDetail() {
    const navigate = useNavigate();

    const handleHexagon = (userId, level) => {
        toast.info(`You clicked on a ${level} hexagon!`);
    };

    return (
        <div className="quiz-of-the-week-detail-container">
            <div className="hexagon-grid">
                <Hexagon className="hexagon easy" level="easy" userId="special" onClick={() => handleHexagon('special', 'easy')} />
                <Hexagon className="hexagon medium" level="medium" userId="special" onClick={() => handleHexagon('special', 'medium')} />
                <Hexagon className="hexagon hard" level="hard" userId="special" onClick={() => handleHexagon('special', 'hard')} />
            </div>
            <button className="back-button" onClick={() => navigate('/quizzes')}>
                Back
            </button>
        </div>
    );
}
