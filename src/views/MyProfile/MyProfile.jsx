import './MyProfile.css';
import {
    Box,
    Button,
    Editable,
    EditableInput,
    EditablePreview,
    Input,
    Stack,
    Text,
    Flex,
    Divider,
} from '@chakra-ui/react';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../state/app.context';
import { updateUser, getUserData, uploadUserAvatar, changeUserPassword, reauthenticateUser, getOrganizerCodes, deleteOrganizerCode } from '../../services/user.service';
import Swal from 'sweetalert2';
import EditableControls from '../../components/EditableControls/EditableControls';
import StatusAvatar from '../../components/StatusAvatar/StatusAvatar';
import NotificationList from '../../components/NotificationList/NotificationList';
import { getNotifications } from '../../services/notification.service';
import useModal from '../../custom-hooks/useModal';

export default function MyProfile() {
    const { user, userData, setAppState } = useContext(AppContext);
    const [formData, setFormData] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [organizerCode, setOrganizerCode] = useState('');
    const [notifications, setNotifications] = useState([]);

    const {
        isModalVisible: isNotificationModalOpen,
        openModal: openNotificationModal,
        closeModal: closeNotificationModal,
    } = useModal();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const fetchedData = await getUserData(user.uid);
                if (fetchedData) {
                    setFormData(fetchedData);
                    setAvatarPreviewUrl(fetchedData.avatar);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        // const fetchNotifications = async () => {
        //     if (user && user.uid) {
        //         const notificationsData = await getNotifications(user.uid);
        //         setNotifications(notificationsData);
        //     }
        // };

        if (user && user.uid) {
            fetchUserData();
            // fetchNotifications();
        }
    }, [user]);

    const updateUserData = (prop) => (value) => {
        setFormData((prevData) => ({
            ...prevData,
            [prop]: value,
        }));
    };

    const saveChanges = async (e) => {
        e.preventDefault();
        if (!formData) return;

        try {
            const updatedData = { ...formData };

            if (avatarFile) {
                const avatarURL = await uploadUserAvatar(formData.uid, avatarFile);
                updatedData.avatar = avatarURL;
            }

            await updateUser(user.uid, updatedData);
            setAppState((prev) => ({
                ...prev,
                userData: updatedData,
            }));

            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your profile has been updated successfully!',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: `Error updating profile: ${error.message}`,
                confirmButtonText: 'OK',
            });
        }
    };

    const discardChanges = () => {
        setFormData({ ...userData });
        setAvatarPreviewUrl(userData.avatar);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmNewPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Password Mismatch',
                text: 'New password and confirmation do not match.',
                confirmButtonText: 'OK',
            });
            return;
        }

        const { value: currentPassword } = await Swal.fire({
            title: 'Re-authentication Required',
            input: 'password',
            inputLabel: 'Enter your current password',
            inputPlaceholder: 'Your current password',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off',
            },
            showCancelButton: true,
        });

        if (!currentPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Cancelled',
                text: 'Password change was cancelled.',
                confirmButtonText: 'OK',
            });
            return;
        }

        try {
            await reauthenticateUser(currentPassword);
            await changeUserPassword(newPassword);
            Swal.fire({
                icon: 'success',
                title: 'Password Changed',
                text: 'Your password has been changed successfully!',
                confirmButtonText: 'OK',
            });

            setNewPassword('');
            setConfirmNewPassword('');
            setShowPasswordChange(false);
        } catch (error) {
            console.error('Error changing password:', error);
            Swal.fire({
                icon: 'error',
                title: 'Password Change Failed',
                text: `Error changing password: ${error.message}`,
                confirmButtonText: 'OK',
            });
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file.size > 200 * 1024) {
            setAvatarFile(null);
            setAvatarPreviewUrl(null);
            Swal.fire({
                icon: 'warning',
                title: 'File Too Large',
                text: 'The selected file is too large. Please choose a file under 200KB.',
                confirmButtonText: 'OK',
            });
            return;
        }

        setAvatarFile(file);
        setAvatarPreviewUrl(URL.createObjectURL(file));
    };

    const handleUseCode = async () => {
        if (!organizerCode) {
            Swal.fire({
                icon: 'warning',
                title: 'No Code Entered',
                text: 'Please enter an organizer code.',
                confirmButtonText: 'OK',
            });
            return;
        }

        try {
            const validCodes = await getOrganizerCodes();
            if (validCodes.includes(organizerCode)) {
                const updatedData = { ...formData, role: 'organizer' };
                await updateUser(user.uid, updatedData);
                await deleteOrganizerCode(organizerCode);
                setAppState((prev) => ({
                    ...prev,
                    userData: updatedData,
                }));
                setFormData(updatedData);
                setOrganizerCode('');

                Swal.fire({
                    icon: 'success',
                    title: 'Organizer Code Accepted',
                    text: 'Your role has been upgraded to organizer!',
                    confirmButtonText: 'OK',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Code',
                    text: 'The organizer code is invalid.',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error('Error using organizer code:', error);
            Swal.fire({
                icon: 'error',
                title: 'Code Error',
                text: `Error using organizer code: ${error.message}`,
                confirmButtonText: 'OK',
            });
        }
    };

    // const handleMarkNotificationAsRead = async (notificationId) => {
    //     try {
    //         await markNotificationAsRead(user.uid, notificationId);
    //         setNotifications((prevNotifications) =>
    //             prevNotifications.map((notification) =>
    //                 notification.id === notificationId
    //                     ? { ...notification, status: 'read' }
    //                     : notification
    //             )
    //         );
    //     } catch (error) {
    //         console.error('Error marking notification as read:', error);
    //     }
    // };

    if (!formData) return <div>Loading...</div>;

    return (
        <Box className="profile-container">
            <Text fontSize="2xl" mb={4}>My Profile</Text>
            <Box className="profile-content">
                <Box className="left-section">
                    <StatusAvatar uid={user.uid} src={avatarPreviewUrl || formData.avatar} boxSize="100px" size="2xl" sx={{ width: '200px', height: '200px' }} mb={2} />
                    <Input
                        type="file"
                        onChange={handleAvatarChange}
                        display="none"
                        id="avatar-upload"
                    />
                    <Button
                        colorScheme="blue"
                        mt={4}
                        onClick={() => document.getElementById('avatar-upload').click()}
                    >
                        Choose File
                    </Button>
                    <Button variant="solid" colorScheme="yellow" mt={2} onClick={() => setShowPasswordChange(!showPasswordChange)}>
                        {showPasswordChange ? 'Cancel Password Change' : 'Change Password'}
                    </Button>
                    {showPasswordChange && (
                        <Box mt={4} className="password-change-container">
                            <Input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                mb={2}
                            />
                            <Input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                mb={2}
                            />
                            <Button colorScheme="blue" onClick={handleChangePassword}>
                                Update Password
                            </Button>
                        </Box>
                    )}
                    <Box mt={4} width="100%">
                        <Button colorScheme="blue" onClick={openNotificationModal} mt={4}>
                            Notifications
                        </Button>
                    </Box>
                    <Box display="flex" alignItems="center" mt="auto">
                        <Input
                            placeholder="Code"
                            maxLength={5}
                            value={organizerCode}
                            onChange={(e) => setOrganizerCode(e.target.value)}
                            width="120px"
                            mr={2}
                        />
                        <Button colorScheme="blue" onClick={handleUseCode} size="sm">
                                    Use Code
                        </Button>
                    </Box>
                </Box>
                <Box className="right-section">
                    <form onSubmit={saveChanges}>
                        <Stack spacing={3}>
                            <Box>
                                <Flex alignItems="center">
                                    <Text className="right-section-label">Username:</Text>
                                    <Editable defaultValue={formData.username} isDisabled>
                                        <EditablePreview className="right-section-data" />
                                        <EditableInput />
                                    </Editable>
                                </Flex>
                            </Box>
                            <Divider my={2} />
                            <Box>
                                <Flex alignItems="center">
                                    <Text className="right-section-label">First Name:</Text>
                                    <Editable
                                        defaultValue={formData.firstName}
                                        onSubmit={(value) => updateUserData('firstName')(value)}
                                    >
                                        <EditablePreview className="right-section-data" />
                                        <EditableInput />
                                        <EditableControls />
                                    </Editable>
                                </Flex>
                            </Box>
                            <Divider my={2} />
                            <Box>
                                <Flex alignItems="center">
                                    <Text className="right-section-label">Last Name:</Text>
                                    <Editable
                                        defaultValue={formData.lastName}
                                        onSubmit={(value) => updateUserData('lastName')(value)}
                                    >
                                        <EditablePreview className="right-section-data" />
                                        <EditableInput />
                                        <EditableControls />
                                    </Editable>
                                </Flex>
                            </Box>
                            <Divider my={2} />
                            <Box>
                                <Flex alignItems="center">
                                    <Text className="right-section-label">Email:</Text>
                                    <Editable defaultValue={formData.email} isDisabled>
                                        <EditablePreview className="right-section-data" />
                                        <EditableInput />
                                    </Editable>
                                </Flex>
                            </Box>
                            <Divider my={2} />
                            <Box>
                                <Flex alignItems="center">
                                    <Text className="right-section-label">Phone Number:</Text>
                                    <Editable
                                        defaultValue={formData.phoneNumber}
                                        onSubmit={(value) => updateUserData('phoneNumber')(value)}
                                    >
                                        <EditablePreview className="right-section-data" />
                                        <EditableInput />
                                        <EditableControls />
                                    </Editable>
                                </Flex>
                            </Box>
                            <Divider my={2} />
                            <Box>
                                <Flex alignItems="center">
                                    <Text className="right-section-label">Role:</Text>
                                    <Text className="right-section-data">
                                        {formData.role}
                                    </Text>
                                </Flex>
                            </Box>
                        </Stack>
                        <Divider my={2} />
                        <Box className="button-container" mt={4} display="flex" justifyContent="space-between">
                            <Box>
                                <Button colorScheme="green" type="submit" className="right-section-save-button" size="sm">
                                    Save
                                </Button>
                                <Button variant="solid" colorScheme="red" ml={2} onClick={discardChanges} size="sm">
                                    Discard Changes
                                </Button>
                            </Box>
                        </Box>
                    </form>
                </Box>
            </Box>
            <NotificationList
                isOpen={isNotificationModalOpen}
                onClose={closeNotificationModal}
            />
        </Box>
    );
}