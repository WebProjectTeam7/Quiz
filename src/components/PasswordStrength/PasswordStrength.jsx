import { HAS_UPPERCASE, HAS_LOWERCASE, HAS_DIGIT, HAS_SPECIAL_CHAR } from '../../common/regex';
import { PASSWORD_STRENGTH_LOW_LENGTH, PASSWORD_STRENGTH_STRONG_LENGTH, WEAK_COLOR, MEDIUM_COLOR, STRONG_COLOR, DEFAULT_COLOR } from '../../common/components.constants';
import PropTypes from 'prop-types';

export default function PasswordStrengthIndicator({ password }) {
    const handlePasswordStrength = (password) => {
        const strengthCheck = {
            lengthLow: password.length >= PASSWORD_STRENGTH_LOW_LENGTH,
            lengthStrong: password.length >= PASSWORD_STRENGTH_STRONG_LENGTH,
            hasUpperCase: HAS_UPPERCASE.test(password),
            hasLowerCase: HAS_LOWERCASE.test(password),
            hasDigit: HAS_DIGIT.test(password),
            hasSpecialChar: HAS_SPECIAL_CHAR.test(password),
        };

        let points = Object.values(strengthCheck).filter((value) => value).length;
        let strength = points > 4 ? 'Strong' : points > 2 ? 'Medium' : 'Weak';

        return {
            points,
            strength,
            activeColor: getActiveColor(strength),
        };
    };

    const getActiveColor = (strength) => {
        return strength === 'Strong' ? STRONG_COLOR : strength === 'Medium' ? MEDIUM_COLOR : WEAK_COLOR;
    };

    let stats = handlePasswordStrength(password);

    const element = (color, key) => (
        <hr
            key={key}
            style={{
                flex: 1,
                border: 'none',
                borderTop: '8px solid',
                borderRadius: '2px',
                margin: '0 5px',
                marginTop: '8px',
                borderTopColor: color,
            }}
        />
    );

    const barElement = [];

    for (let i = 0; i < stats.points; i++) {
        barElement.push(element(stats.activeColor, i));
    }
    for (let i = 0; i < 6 - stats.points; i++) {
        barElement.push(element(DEFAULT_COLOR, i + stats.points));
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                {barElement}
            </div>
            {password && (
                <p style={{ color: stats.activeColor, fontSize: 'smaller' }}>
                    Your password has {stats.strength.toLowerCase()} strength
                </p>
            )}
        </>
    );
}

PasswordStrengthIndicator.propTypes = {
    password: PropTypes.string.isRequired,
};
