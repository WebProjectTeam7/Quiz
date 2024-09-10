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
    Input,
    Text,
    Link
} from '@chakra-ui/react';
import propTypes from 'prop-types';
import './LoginModal.css';
import { loginUser } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { useState } from 'react';
import { getUserByUsername, monitorUserStatus } from '../../services/user.service';
import { auth } from '../../config/firebase-config';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isVisible, onClose, openRegisterModal  }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        try {
            const user = await getUserByUsername(username);
            if (!user) {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    confirmButtonText: 'OK',
                });
                setLoading(false);
                return;
            }

            if (user.banned) {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: 'Your account has been banned.',
                    confirmButtonText: 'OK',
                });
                setLoading(false);
                return;
            }

            const email = user.email;

            await loginUser(email, password);
            const uid = auth.currentUser.uid;
            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                confirmButtonText: 'OK',
            });
            monitorUserStatus(uid);
            onClose();
            window.location.reload();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
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
                <ModalHeader>Login</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl id="username" isRequired>
                        <FormLabel>Username</FormLabel>
                        <Input
                            type="text"
                            placeholder="Username"
                            className="login-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            borderColor="blue.400"
                        />
                    </FormControl>

                    <FormControl id="password" isRequired mt={4}>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            placeholder="Password"
                            className="login-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            borderColor="blue.400"
                        />
                    </FormControl>
                    <Text mt={4} color="black">
                        Don't have an account?{' '}
                        <Link color="teal.500" onClick={() => {
                            onClose();
                            openRegisterModal();
                        }}>
                            Register here
                        </Link>
                    </Text>
                </ModalBody>

                <ModalFooter>
                    <Button
                        colorScheme="blue"
                        onClick={handleLogin}
                        className="login-login-button"
                        w="80px"
                        isLoading={loading}
                    >
                        Login
                    </Button>
                    <Button variant="ghost" onClick={onClose} className="login-cancel-button">Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

LoginModal.propTypes = {
    isVisible: propTypes.bool.isRequired,
    onClose: propTypes.func.isRequired,
    openRegisterModal: propTypes.func.isRequired,
};