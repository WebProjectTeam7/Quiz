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
import { monitorUserStatus } from '../../services/user.service';
import { auth } from '../../config/firebase-config';

export default function LoginModal({ isVisible, onClose, openRegisterModal  }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await loginUser(email, password);
            const uid = auth.currentUser.uid;
            // Swal.fire({                                   //Strange error when
            //     icon: 'success',
            //     title: 'Login Successful',
            //     confirmButtonText: 'OK',
            // });
            monitorUserStatus(uid);
            onClose();
        } catch (error) {
            // Swal.fire({
            //     icon: 'error',                            //Strange error when
            //     title: 'Login Failed',
            //     text: error.message,
            //     confirmButtonText: 'OK',
            // });
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
                    <FormControl id="email" isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                            type="email"
                            placeholder="Email"
                            className="login-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                    <Text mt={4}>
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