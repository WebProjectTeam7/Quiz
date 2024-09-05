/* eslint-disable react/display-name */
import { forwardRef } from 'react';
import './Hexagon.css';
import PropTypes from 'prop-types';

const Hexagon = forwardRef(({ quiz, onClick, userId }, ref) => {
    const level = quiz.difficulty;

    return (
        <div
            ref={ref}
            className={`hexagon ${level}`}
            onClick={() => onClick(userId, level)}
        >
            <div className="hexagon-in">
                <div className="hexagon-content">{quiz.title}</div>
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
