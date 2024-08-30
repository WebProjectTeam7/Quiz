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
import { useState } from 'react';
import PropTypes from 'prop-types';
import { sendNotificationToUser } from '../../services/notification.service';
import { notificationEnum } from '../../common/notification-enum';
import { MAX_NOTIFICATION_LENGTH } from '../../common/components.constants';
import Swal from 'sweetalert2';

export default function NotificationModal({ isOpen, onClose, recipientUid }) {
    const [message, setMessage] = useState('');
    const [notificationType, setNotificationType] = useState(notificationEnum.TEXT);

    const handleSendNotification = async () => {
        if (!message.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Message cannot be empty.',
                confirmButtonText: 'OK',
            });
            return;
        }

        const notificationContent = `${notificationType}: ${message}`;

        try {
            await sendNotificationToUser(recipientUid, notificationContent);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Notification sent successfully.',
                confirmButtonText: 'OK',
            });
            setMessage('');
            setNotificationType('Text');
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
                    <Textarea
                        placeholder="Enter your message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={MAX_NOTIFICATION_LENGTH}
                    />
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