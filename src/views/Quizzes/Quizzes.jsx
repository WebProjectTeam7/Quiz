// src/pages/Quizzes.js
import './Quizzes.css';
import { useNavigate } from 'react-router-dom';
import Hexagon from '../../components/Hexagon/Hexagon';
import { useState } from 'react';

export default function Quizzes() {
    const navigate = useNavigate();
    const [clickedHexagon, setClickedHexagon] = useState(null);

    const handleHexagon = (userId, level) => {
        navigate(`/quizzes/${level}/${userId}`);
        setClickedHexagon(`${userId}-${level}`);
        setTimeout(() => setClickedHexagon(null), 2000);
    };

    const hexagonClass = (userId, level) => (
        `hexagon ${level} ${clickedHexagon === `${userId}-${level}` ? 'clicked' : ''}`
    );

    return (
        <div className="quizzes-container">
            <div className="search-bar">
                <input type="text" placeholder="Enter search query" />
            </div>
            <div className="navigation-buttons">
                <button onClick={() => navigate('/quiz-of-the-week')}>Quiz of the Week</button>
                <button onClick={() => navigate('/ranking')}>Ranking</button>
                <button onClick={() => navigate('/tournaments')}>Tournament</button>
            </div>
            <div className="hexagon-grid">
                <div className="hexagon-group">
                    {['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7'].map(userId => (
                        <Hexagon key={userId} className={hexagonClass(userId, 'easy')} level="easy" userId={userId} onClick={handleHexagon} />
                    ))}
                </div>
                <div className="hexagon-group">
                    {['user8', 'user9', 'user10', 'user11', 'user12', 'user13', 'user14'].map(userId => (
                        <Hexagon key={userId} className={hexagonClass(userId, 'medium')} level="medium" userId={userId} onClick={handleHexagon} />
                    ))}
                </div>
                <div className="hexagon-group">
                    {['user15', 'user16', 'user17', 'user18', 'user19', 'user20', 'user21'].map(userId => (
                        <Hexagon key={userId} className={hexagonClass(userId, 'hard')} level="hard" userId={userId} onClick={handleHexagon} />
                    ))}
                </div>
            </div>
        </div>
    );
}
