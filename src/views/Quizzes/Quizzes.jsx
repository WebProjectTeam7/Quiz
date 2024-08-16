/* eslint-disable indent */
import './Quizzes.css';
import { useNavigate } from 'react-router-dom';
import Hexagon from '/Quiz/src/components/Header/Hexagon/Hexagon';

export default function Quizzes() {
    const navigate = useNavigate();

    const handleHexagon = (level) => {
        navigate(`/quizzes/${level}`);
    };


    return (
        <div className="quizzes-container">
        <div className="search-bar">
            <input type="text" placeholder="Enter search query" />
        </div>
        <div className="navigation-buttons">
            <button onClick={() => navigate('/quizzes')}>Quizzes</button>
            <button onClick={() => navigate('/quiz-of-the-week')}>Quiz of the Week</button>
            <button onClick={() => navigate('/ranking')}>Ranking</button>
            <button onClick={() => navigate('/tournaments')}>Tournament</button>
        </div>
        <div className="hexagon-grid">
            <div className="hexagon-group">
                <Hexagon level="easy" onClick={() => handleHexagon('easy')} />
                <Hexagon level="easy" onClick={() => handleHexagon('easy')} />
                <Hexagon level="easy" onClick={() => handleHexagon('easy')} />
                <Hexagon level="easy" onClick={() => handleHexagon('easy')} />
                <Hexagon level="easy" onClick={() => handleHexagon('easy')} />
                <Hexagon level="easy" onClick={() => handleHexagon('easy')} />
                <Hexagon level="easy" onClick={() => handleHexagon('easy')} />
            </div>
            <div className="hexagon-group">
                <Hexagon level="medium" onClick={() => handleHexagon('medium')} />
                <Hexagon level="medium" onClick={() => handleHexagon('medium')} />
                <Hexagon level="medium" onClick={() => handleHexagon('medium')} />
                <Hexagon level="medium" onClick={() => handleHexagon('medium')} />
                <Hexagon level="medium" onClick={() => handleHexagon('medium')} />
                <Hexagon level="medium" onClick={() => handleHexagon('medium')} />
                <Hexagon level="medium" onClick={() => handleHexagon('medium')} />
            </div>
            <div className="hexagon-group">
                <Hexagon level="hard" onClick={() => handleHexagon('hard')} />
                <Hexagon level="hard" onClick={() => handleHexagon('hard')} />
                <Hexagon level="hard" onClick={() => handleHexagon('hard')} />
                <Hexagon level="hard" onClick={() => handleHexagon('hard')} />
                <Hexagon level="hard" onClick={() => handleHexagon('hard')} />
                <Hexagon level="hard" onClick={() => handleHexagon('hard')} />
                <Hexagon level="hard" onClick={() => handleHexagon('hard')} />
            </div>
        </div>
    </div>
);
}