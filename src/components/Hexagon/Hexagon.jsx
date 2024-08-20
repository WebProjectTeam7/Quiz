/* eslint-disable react/display-name */
import { forwardRef } from 'react';
import './Hexagon.css';
import PropTypes from 'prop-types';

const Hexagon = forwardRef(({ level, onClick, userId }, ref) => {
    return (
        <div
            ref={ref}
            className={`hexagon ${level}`}
            onClick={() => onClick(userId, level)}
        >
            <div className="hexagon-in">
                <div className="hexagon-content">{level.toUpperCase()} QUIZZES</div>
            </div>
        </div>
    );
});

Hexagon.propTypes = {
    level: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
};

export default Hexagon;
