import PropTypes from 'prop-types';
import { useContext } from 'react';
import { AppContext } from '../state/app.context';
import { Navigate } from 'react-router-dom';

export default function RedirectIfAuthenticated({ children }) {
    const { user } = useContext(AppContext);

    if (user) {
        return <Navigate replace to="/" />;
    }

    return (
        <>
            {children}
        </>
    );
}

RedirectIfAuthenticated.propTypes = {
    children: PropTypes.any,
};