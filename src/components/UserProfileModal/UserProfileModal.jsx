import { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Text,
    Box,
    Flex,
} from '@chakra-ui/react';
import { getUserByUsername } from '../../services/user.service';
import PropTypes from 'prop-types';
import StatusAvatar from '../StatusAvatar/StatusAvatar';

export default function UserProfileModal({ isOpen, onClose, username }) {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getUserByUsername(username);
                if (data) {
                    setUserData(data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (username) {
            fetchUserData();
        }
    }, [username]);

    if (!userData) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{userData.username}'s Profile</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                        <StatusAvatar uid={userData.uid} src={userData.avatar} size="xl" />
                        <Text fontSize="lg" fontWeight="bold" mt={2}>{userData.role}</Text>
                    </Box>
                    <Box>
                        <Flex>
                            <Text fontWeight="bold" mr={2}>Username:</Text>
                            <Text>{userData.username}</Text>
                        </Flex>
                        <Flex>
                            <Text fontWeight="bold" mr={2}>First Name:</Text>
                            <Text>{userData.firstName}</Text>
                        </Flex>
                        <Flex>
                            <Text fontWeight="bold" mr={2}>Last Name:</Text>
                            <Text>{userData.lastName}</Text>
                        </Flex>
                        <Flex>
                            <Text fontWeight="bold" mr={2}>Points:</Text>
                            <Text>{userData.points}</Text>
                        </Flex>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

UserProfileModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    username: PropTypes.string.isRequired,
};