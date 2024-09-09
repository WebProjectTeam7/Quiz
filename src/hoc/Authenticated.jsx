import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { AppContext } from '../state/app.context';
import { Navigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Authenticated({ children, requiredRole }) {
    const { user, userData } = useContext(AppContext);
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Access Denied',
                text: 'You must be a registered user to access this page.',
                confirmButtonText: 'Login',
            });
        }
    }, [user]);

    if (!user) {
        return <Navigate replace to="/login" state={{ from: location }} />;
    }

    if (!userData) {
        return <div>Loading...</div>;
    }

    if (requiredRole && userData.role !== requiredRole) {
        Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: `You must be a ${requiredRole} to access this page.`,
            confirmButtonText: 'OK',
        });
        return <Navigate replace to="/" state={{ from: location }} />;
    }

    return <>{children}</>;
}

Authenticated.propTypes = {
    children: PropTypes.any,
    requiredRole: PropTypes.string,
};
