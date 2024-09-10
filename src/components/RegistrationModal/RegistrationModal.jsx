import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,InputGroup,
    InputLeftAddon,
    Stack,
    HStack,
    RadioGroup,
    Radio,
} from '@chakra-ui/react';
import { registerUser } from '../../services/auth.service';
import { createUser, getOrganizerCodes, getEmail, getPhoneNumber, getUserByUsername, deleteOrganizerCode } from '../../services/user.service';
import { useContext, useState } from 'react';
import { AppContext } from '../../state/app.context';
import { useNavigate } from 'react-router-dom';
import { EMAIL_REGEX, PASSWORD_REGEX, USER_REGEX, NAME_REGEX, PHONE_REGEX } from '../../common/regex';
import RoleEnum from '../../common/role-enum';
import Swal from 'sweetalert2';
import { FaEye } from 'react-icons/fa';
import PasswordStrengthIndicator from '../PasswordStrength/PasswordStrength';
import propTypes from 'prop-types';
import './RegistrationModal.css';

export default function RegistrationModal({ isVisible, onClose }) {
    const { setAppState } = useContext(AppContext);
    const [user, setUser] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        role: RoleEnum.STUDENT,
        phoneNumber: '',
        organizerCode: '',
    });

    const [hidePassword, setHidePassword] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isOrganizer, setIsOrganizer] = useState(false);

    const togglePasswordVisibility = () => {
        setHidePassword(!hidePassword);
    };

    const navigate = useNavigate();

    const handleRoleChange = (role) => {
        setUser({ ...user, role });
        setIsOrganizer(role === RoleEnum.ORGANIZER);
    };

    const updateUser = (prop) => (e) => {
        setUser({
            ...user,
            [prop]: e.target.value,
        });
    };

    const register = async (e) => {
        e.preventDefault();
        setLoading(true);

        const alertArr = [];

        if (!USER_REGEX.test(user.username)) {
            alertArr.push('Invalid Username!');
        }

        if (!EMAIL_REGEX.test(user.email)) {
            alertArr.push('Invalid Email address!');
        }

        if (!NAME_REGEX.test(user.firstName)) {
            alertArr.push('Invalid First name!');
        }

        if (!NAME_REGEX.test(user.lastName)) {
            alertArr.push('Invalid Last name!');
        }

        if (!PASSWORD_REGEX.test(user.password)) {
            alertArr.push('Invalid Password!');
        }

        if (user.password !== user.confirmPassword) {
            alertArr.push('Passwords don\'t match!');
        }

        if (!PHONE_REGEX.test(user.phoneNumber)) {
            alertArr.push('Phone number must be 10 digits!');
        }

        const validOrganizerCodes = await getOrganizerCodes();
        if (isOrganizer && !validOrganizerCodes.includes(user.organizerCode)) {
            alertArr.push('Invalid Organizer code!');
        }

        if (alertArr.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: alertArr.join('\n'),
                confirmButtonText: 'OK',
            });
            setLoading(false);
            return;
        }

        try {
            const userFromDB = await getUserByUsername(user.username);
            if (userFromDB) {
                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: `User ${user.username} already exists!`,
                    confirmButtonText: 'OK',
                });
                setLoading(false);
                return;
            }

            const emailFromDB = await getEmail(user.email);
            if (emailFromDB) {
                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: 'Email address already exists!',
                    confirmButtonText: 'OK',
                });
                setLoading(false);
                return;
            }

            const phoneNumberFromDB = await getPhoneNumber(user.phoneNumber);
            if (phoneNumberFromDB) {
                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: 'Phone number already exists!',
                    confirmButtonText: 'OK',
                });
                setLoading(false);
                return;
            }

            const credential = await registerUser(user.email, user.password);
            await createUser(user.username,
                credential.user.uid,
                user.email,
                user.firstName,
                user.lastName,
                user.role,
                user.phoneNumber,
                isOrganizer ? user.organizerCode : null
            );

            if (isOrganizer) {
                await deleteOrganizerCode(user.organizerCode);
            }

            setAppState({ user: credential.user, userData: null });

            Swal.fire({
                icon: 'success',
                title: 'Registration Successful',
                text: 'You have successfully registered.',
                confirmButtonText: 'OK',
            });

            setUser({
                username: '',
                email: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                password: '',
                confirmPassword: '',
                role: RoleEnum.STUDENT,
            });

            onClose();
            navigate('/');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Registration Error',
                text: error.message,
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isVisible} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Register</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <form onSubmit={register}>
                        <Stack spacing={3}>
                            <RadioGroup defaultValue={user.role} onChange={handleRoleChange}>
                                <HStack spacing="24px">
                                    <Radio value={RoleEnum.STUDENT}>Student</Radio>
                                    <Radio value={RoleEnum.ORGANIZER}>Organizer</Radio>
                                </HStack>
                            </RadioGroup>

                            <FormControl id="username" isRequired>
                                <FormLabel>Username</FormLabel>
                                <Input
                                    value={user.username}
                                    onChange={updateUser('username')}
                                    type="text"
                                    className="registration-username"
                                />
                            </FormControl>

                            <FormControl id="email" isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input
                                    value={user.email}
                                    onChange={updateUser('email')}
                                    type="email"
                                    className="registration-email"
                                />
                            </FormControl>

                            <FormControl id="firstName" isRequired>
                                <FormLabel>First Name</FormLabel>
                                <Input
                                    value={user.firstName}
                                    onChange={updateUser('firstName')}
                                    type="text"
                                    className="registration-firstname"
                                />
                            </FormControl>

                            <FormControl id="lastName" isRequired>
                                <FormLabel>Last Name</FormLabel>
                                <Input
                                    value={user.lastName}
                                    onChange={updateUser('lastName')}
                                    type="text"
                                    className="registration-lastname"
                                />
                            </FormControl>

                            <FormControl id="phoneNumber" isRequired >
                                <FormLabel>Phone Number</FormLabel>
                                <InputGroup>
                                    <InputLeftAddon className="phone-left-addon">+359</InputLeftAddon>
                                    <Input
                                        type="tel"
                                        placeholder="Phone number"
                                        value={user.phoneNumber}
                                        onChange={updateUser('phoneNumber')}
                                        className="registration-phone"
                                    />
                                </InputGroup>
                            </FormControl>

                            <FormControl id="password" isRequired>
                                <FormLabel>Password</FormLabel>
                                <Input
                                    value={user.password}
                                    onChange={updateUser('password')}
                                    type={hidePassword ? 'password' : 'text'}
                                    className="registration-password"
                                />
                                <FaEye
                                    onClick={togglePasswordVisibility}
                                    style={{ cursor: 'pointer', marginTop: '5px', color: !hidePassword ? '#FF0054' : 'rgb(237, 243, 182)' }}
                                />
                                <PasswordStrengthIndicator password={user.password} />
                            </FormControl>

                            <FormControl id="confirmPassword" isRequired>
                                <FormLabel>Confirm Password</FormLabel>
                                <Input
                                    value={user.confirmPassword}
                                    onChange={updateUser('confirmPassword')}
                                    type={hidePassword ? 'password' : 'text'}
                                    className="registration-confirm-password"
                                />
                            </FormControl>
                        </Stack>
                    </form>
                </ModalBody>
                <ModalFooter>
                    {isOrganizer && (
                        <HStack className="register-code" spacing={4} mr={4} mb={4} mt={-4}>
                            <FormControl id="organizerCode" isRequired>
                                <FormLabel>Organizer Code</FormLabel>
                                <Input
                                    value={user.organizerCode}
                                    onChange={updateUser('organizerCode')}
                                    type="text"
                                    maxLength={5}
                                    className="organizer-code"
                                />
                            </FormControl>
                        </HStack>
                    )}
                    <Button
                        colorScheme="blue"
                        type="submit"
                        isLoading={loading}
                        className="registration-register-button"
                        onClick={register}
                    >
                        Register
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="registration-cancel-button"
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

RegistrationModal.propTypes = {
    isVisible: propTypes.bool.isRequired,
    onClose: propTypes.func.isRequired,
};