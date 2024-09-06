import { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Text, Box, Flex, IconButton } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import { getOrganizerCodes } from '../../services/user.service';
import { addOrganizerCode } from '../../services/admin.service';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';

export default function OrganizerCodeModal({ isOpen, onClose }) {
    const [organizerCodes, setOrganizerCodes] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchOrganizerCodes();
        }
    }, [isOpen]);

    const fetchOrganizerCodes = async () => {
        try {
            const codes = await getOrganizerCodes();
            setOrganizerCodes(codes);
        } catch (error) {
            console.error('Error fetching organizer codes:', error);
        }
    };

    const handleGenerateCode = async () => {
        try {
            const newCode = await addOrganizerCode();
            setOrganizerCodes([...organizerCodes, newCode]);
            Swal.fire({
                icon: 'success',
                title: 'New Code Generated',
                text: `Code: ${newCode}`,
            });
        } catch (error) {
            console.error('Error generating new code:', error);
        }
    };

    const handleCopyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        Swal.fire({
            icon: 'success',
            title: 'Copied to Clipboard',
            text: `Code: ${code} copied successfully!`,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Manage Organizer Codes</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box mb={4}>
                        <Button colorScheme="teal" aria-hidden={false} onClick={handleGenerateCode}>Generate New Code</Button>
                    </Box>
                    <Box>
                        {organizerCodes.length > 0 ? (
                            organizerCodes.map((code) => (
                                <Flex key={code} justifyContent="space-between" alignItems="center" mb={2}>
                                    <Text>{code}</Text>
                                    <Button
                                        leftIcon={<CopyIcon />}
                                        colorScheme="gray"
                                        onClick={() => handleCopyToClipboard(code)}
                                    >
                                        Copy
                                    </Button>
                                </Flex>
                            ))
                        ) : (
                            <Text>No available codes</Text>
                        )}
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

OrganizerCodeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};