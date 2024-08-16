import './Hexagon.css';
import PropTypes from 'prop-types';

export default function Hexagon({ level, onClick, userId }) {
    return (
        <div className={`hexagon ${level}`} onClick={() => onClick(userId, level)}>
            <div className="hexagon-in">
                <div className="hexagon-content">{level.toUpperCase()} QUIZZES</div>
            </div>
        </div>
    );
}

Hexagon.propTypes = {
    level: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
};