import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    Select,
    Textarea,
} from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { sendNotificationToUser } from '../../services/notification.service';
import { notificationEnum } from '../../common/notification-enum';
import { MAX_NOTIFICATION_LENGTH } from '../../common/components.constants';
import Swal from 'sweetalert2';
import { AppContext } from '../../state/app.context';
import { getUserData } from '../../services/user.service';
import { getQuizzesByAuthor } from '../../services/quiz.service';
import QuizAccessEnum from '../../common/access-enum';

export default function NotificationModal({ isOpen, onClose, recipientUid }) {
    const [message, setMessage] = useState('');
    const [notificationType, setNotificationType] = useState(notificationEnum.INVITE_TO_ORGANIZATION);
    const { user } = useContext(AppContext);
    const [customUserData, setCustomUserData] = useState(null);
    const [selectedQuizId, setSelectedQuizId] = useState('');
    const [quizzes, setQuizzes] = useState([]);

    useEffect(() => {
        if (user && user.uid) {
            fetchCustomUserData(user.uid).then((userData) => {
                if (userData && userData.username) {
                    setCustomUserData(userData);
                    fetchUserQuizzes(userData.username);
                }
            }).catch(error => {
                console.error('Error fetching custom user data:', error);
            });
        }
    }, [user]);
    const fetchUserQuizzes = async (username) => {
        try {
            const userQuizzes = await getQuizzesByAuthor(username);
            const privateQuizzes = userQuizzes.filter(quiz => quiz.type === QuizAccessEnum.PRIVATE);
            setQuizzes(privateQuizzes);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch quizzes.',
                confirmButtonText: 'OK',
            });
        }
    };

    const fetchCustomUserData = async (uid) => {
        try {
            const data = await getUserData(uid);
            return data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch user data.',
                confirmButtonText: 'OK',
            });
            return null;
        }
    };

    const handleSendNotification = async () => {
        try {
            let notificationContent;
            let notificationData = {};

            if (notificationType === notificationEnum.INVITE_TO_ORGANIZATION) {
                if (!customUserData.username || !customUserData.organizationName || !customUserData.organizationId) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'User information is incomplete. Cannot send the invitation.',
                        confirmButtonText: 'OK',
                    });
                    return;
                }

                notificationContent = `I, ${customUserData.username}, invite you to join my organization ${customUserData.organizationName}.`;
                notificationData = {
                    message: notificationContent,
                    type: notificationType,
                    organizationId: customUserData.organizationId,
                    organizationName: customUserData.organizationName,
                };
            } else if (notificationType === notificationEnum.INVITE_TO_QUIZ) {
                if (!selectedQuizId) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'No Quiz Selected',
                        text: 'Please select a quiz before sending an invitation.',
                        confirmButtonText: 'OK',
                    });
                    return;
                }

                const selectedQuiz = quizzes.find(quiz => quiz.id === selectedQuizId);
                if (!selectedQuiz) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Quiz Not Found',
                        text: 'The selected quiz could not be found. Please try again.',
                        confirmButtonText: 'OK',
                    });
                    return;
                }

                notificationContent = `I, ${customUserData.username}, invite you to join my quiz "${selectedQuiz.title}".`;
                notificationData = {
                    message: notificationContent,
                    type: notificationType,
                    quizId: selectedQuizId,
                    quizTitle: selectedQuiz.title,
                    quizCategory: selectedQuiz.category,
                    quizDifficulty: selectedQuiz.difficulty,
                    quizPoints: selectedQuiz.totalPoints,
                    senderName: customUserData.username,
                };
            } else if (notificationType === notificationEnum.TEXT && message.trim()) {
                notificationContent = message.trim();
                notificationData = {
                    message: notificationContent,
                    type: notificationType,
                };
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Message cannot be empty for text notifications.',
                    confirmButtonText: 'OK',
                });
                return;
            }

            await sendNotificationToUser(recipientUid, notificationData);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Notification sent successfully.',
                confirmButtonText: 'OK',
            });
            setMessage('');
            setNotificationType(notificationEnum.INVITE_TO_ORGANIZATION);
            onClose();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to send notification.',
                confirmButtonText: 'OK',
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Send Notification</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Select
                        value={notificationType}
                        onChange={(e) => setNotificationType(e.target.value)}
                        mb={4}
                    >
                        <option value={notificationEnum.INVITE_TO_ORGANIZATION}>Invite to Organization</option>
                        <option value={notificationEnum.INVITE_TO_QUIZ}>Invite to Quiz</option>
                        <option value={notificationEnum.TEXT}>Text</option>
                    </Select>
                    {notificationType === notificationEnum.TEXT && (
                        <Textarea
                            placeholder="Enter your message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={MAX_NOTIFICATION_LENGTH}
                        />
                    )}
                    {notificationType === notificationEnum.INVITE_TO_QUIZ && (
                        <Select
                            placeholder="Select Quiz"
                            value={selectedQuizId}
                            onChange={(e) => setSelectedQuizId(e.target.value)}
                            mb={4}
                        >
                            {quizzes.map((quiz) => (
                                <option key={quiz.id} value={quiz.id}>
                                    {quiz.title}
                                </option>
                            ))}
                        </Select>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" onClick={handleSendNotification}>
                        Send
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

NotificationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    recipientUid: PropTypes.string.isRequired,
};