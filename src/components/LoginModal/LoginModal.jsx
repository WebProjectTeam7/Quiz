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
    Input
} from '@chakra-ui/react';
import propTypes from 'prop-types';
import './LoginModal.css';

export default function LoginModal({ isVisible, onClose }) {
    return (
        <Modal isOpen={isVisible} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Login</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl id="email" isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input type="email" placeholder="Email" className="login-email" borderColor="blue.400"/>
                    </FormControl>

                    <FormControl id="password" isRequired mt={4}>
                        <FormLabel>Password</FormLabel>
                        <Input type="password" placeholder="Password" className="login-password" borderColor="blue.400"/>
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" onClick={onClose} className="login-login-button"w="80px">
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
};