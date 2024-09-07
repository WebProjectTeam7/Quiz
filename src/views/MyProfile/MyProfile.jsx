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
    Divider,
    HStack,
} from '@chakra-ui/react';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../state/app.context';
import { updateUser, getUserData, uploadUserAvatar, changeUserPassword, reauthenticateUser, getOrganizerCodes, deleteOrganizerCode } from '../../services/user.service';
import Swal from 'sweetalert2';
import EditableControls from '../../components/EditableControls/EditableControls';
import StatusAvatar from '../../components/StatusAvatar/StatusAvatar';
import NotificationList from '../../components/NotificationList/NotificationList';
import useModal from '../../custom-hooks/useModal';
import { getOrganizationById } from '../../services/organization.service';
import useNotifications from '../../custom-hooks/UseNotifications';

export default function MyProfile() {
    const { user, userData, setAppState } = useContext(AppContext);
    const [formData, setFormData] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [organizerCode, setOrganizerCode] = useState('');
    const [organizationData, setOrganizationData] = useState(null);

    const { newNotifications } = useNotifications();

    const {
        isModalVisible: isNotificationModalOpen,
        openModal: openNotificationModal,
        closeModal: closeNotificationModal,
    } = useModal();


    useEffect(() => {
        const fetchData = async () => {
            if (user && user.uid) {
                await fetchUserData();
            }
        };

        fetchData();
    }, [user]);

    const fetchUserData = async () => {
        try {
            const fetchedData = await getUserData(user.uid);
            if (fetchedData) {
                setFormData(fetchedData);
                setAvatarPreviewUrl(fetchedData.avatar);

                if (fetchedData.organizationId) {
                    const orgData = await getOrganizationById(fetchedData.organizationId);
                    setOrganizationData(orgData);
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

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
                        {showPasswordChange ? 'Cancel' : 'Change Password'}
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
                            <Button ml={7} colorScheme="blue" onClick={handleChangePassword}>
                                Update Password
                            </Button>
                        </Box>
                    )}
                    <Box mt={4} width="100%">
                        <button
                            id="notificationButton"
                            className={`button ${newNotifications.length === 0 ? 'has-notifications' : ''}`}
                            onClick={openNotificationModal}
                            style={{ marginLeft: '25px' }}
                        >
                            <svg className="bell" viewBox="0 0 448 512">
                                <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"></path>
                            </svg>
                            Notifications
                        </button>
                        {organizationData && (
                            <Box mt={4} textAlign="center">
                                <img
                                    src={organizationData.logoUrl}
                                    alt={organizationData.name}
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto' }}
                                />
                                <Text mt={2}><strong>Organization:</strong> {organizationData.name}</Text>
                            </Box>
                        )}
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

                            <HStack>
                                <Text className="right-section-label">Username:</Text>
                                <Editable mt={3} defaultValue={formData.username} isDisabled>
                                    <EditablePreview className="right-section-data" />
                                    <EditableInput />
                                </Editable>
                            </HStack>
                            <Divider my={1} />

                            <HStack>
                                <Text className="right-section-label">First Name:</Text>
                                <Editable
                                    value={formData.firstName}
                                    onChange={(value) => updateUserData('firstName')(value)}
                                >
                                    <HStack>
                                        <EditablePreview mt={3} className="right-section-data" />
                                        <EditableInput />
                                        <EditableControls />
                                    </HStack>
                                </Editable>
                            </HStack>
                            <Divider my={1} />

                            <HStack>
                                <Text className="right-section-label">Last Name:</Text>
                                <Editable
                                    value={formData.lastName}
                                    onChange={(value) => updateUserData('lastName')(value)}
                                >
                                    <HStack>
                                        <EditablePreview mt={3} className="right-section-data" />
                                        <EditableInput />
                                        <EditableControls />
                                    </HStack>
                                </Editable>
                            </HStack>
                            <Divider my={1} />

                            <HStack>
                                <Text className="right-section-label">Email:</Text>
                                <Editable mt={3} defaultValue={formData.email} isDisabled>
                                    <EditablePreview className="right-section-data" />
                                    <EditableInput />
                                </Editable>
                            </HStack>
                            <Divider my={2} />

                            <HStack>
                                <Text className="right-section-label">Phone Number:</Text>
                                <Editable
                                    value={formData.phoneNumber || ''}
                                    onChange={(value) => updateUserData('phoneNumber')(value)}
                                >
                                    <HStack>
                                        <EditablePreview mt={3} className="right-section-data" />
                                        <EditableInput />
                                        <EditableControls />
                                    </HStack>
                                </Editable>
                            </HStack>
                            <Divider my={1} />

                            <HStack>
                                <Text className="right-section-label" >Role:</Text>
                                <Text className="right-section-data">{formData.role}</Text>
                            </HStack>
                        </Stack>

                        <Divider my={2} />
                        <Box className="button-container" mt={100} display="flex" justifyContent="space-between">
                            <Box>
                                <Button colorScheme="green" type="submit" className="right-section-save-button" size="sm">
                                    Save
                                </Button>
                                <Button variant="solid" colorScheme="red" ml={2} onClick={discardChanges} size="sm">
                                    Discard
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
