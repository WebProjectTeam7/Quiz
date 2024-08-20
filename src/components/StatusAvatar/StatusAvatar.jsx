import { useEffect, useState } from 'react';
import { Avatar, AvatarBadge } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { getUserStatus } from '../../services/user.service';

const StatusAvatar = ({ uid, src, size }) => {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const unsubscribe = getUserStatus(uid, setIsOnline);

        return () => unsubscribe();
    }, [uid]);

    return (
        <Avatar src={src} size={size}>
            <AvatarBadge boxSize="1.25em" bg={isOnline ? 'green.500' : 'red.500'} />
        </Avatar>
    );
};

StatusAvatar.propTypes = {
    uid: PropTypes.string.isRequired,
    src: PropTypes.string,
    size: PropTypes.string,
};

StatusAvatar.defaultProps = {
    src: '',
};

export default StatusAvatar;
