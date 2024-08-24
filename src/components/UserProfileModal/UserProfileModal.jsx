import { useState, useEffect, useContext } from 'react';
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
    Button,
    Input,
} from '@chakra-ui/react';
import { getUserByUsername, sendNotificationToUser } from '../../services/user.service';
import PropTypes from 'prop-types';
import StatusAvatar from '../StatusAvatar/StatusAvatar';
import { AppContext } from '../../state/app.context';
import Swal from 'sweetalert2';

export default function UserProfileModal({ isOpen, onClose, username }) {
    const [userData, setUserData] = useState(null);
    const [notification, setNotification] = useState('');
    const [sending, setSending] = useState(false);
    const { userData: currentUserData } = useContext(AppContext);

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

    const handleSendNotification = async () => {
        if (!notification.trim()) return;

        setSending(true);
        try {
            await sendNotificationToUser(userData.uid, notification);
            setNotification('');
            Swal.fire({
                icon: 'success',
                title: 'Notification Sent',
                text: 'The notification was sent successfully!',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error('Error sending notification:', error);
            Swal.fire({
                icon: 'error',
                title: 'Notification Failed',
                text: 'There was an error sending the notification.',
                confirmButtonText: 'OK',
            });
        } finally {
            setSending(false);
        }
    };

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
                    {currentUserData?.role === 'organizer'  || currentUserData?.role === 'admin' && (
                        <Box mt={4}>
                            <Text fontWeight="bold" mb={2}>Send Notification</Text>
                            <Input
                                placeholder="Enter your notification message"
                                value={notification}
                                onChange={(e) => setNotification(e.target.value)}
                                mb={2}
                            />
                            <Button
                                colorScheme="blue"
                                onClick={handleSendNotification}
                                isLoading={sending}
                            >
                                Send Notification
                            </Button>
                        </Box>
                    )}
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