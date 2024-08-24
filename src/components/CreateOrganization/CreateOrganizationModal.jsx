import React, { useState } from 'react';
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
    Textarea,
    Image,
    VStack,
    HStack
} from '@chakra-ui/react';
import { createOrganization } from '../../services/organization.service'; // Assuming you have a createOrganization service
import './CreateOrgaznizationModal.css';

const CreateOrganizationModal = ({ isOpen, onClose, userId, onOrganizationCreated }) => {
    const [orgName, setOrgName] = useState('');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleCreateOrganization = async () => {
        setIsSubmitting(true);
        try {
            const organization = {
                name: orgName,
                description,
                founder: userId,
                admin: userId,
                logo: logo ? logo : null,
            };
            const newOrg = await createOrganization(organization);
            if (onOrganizationCreated) {
                onOrganizationCreated(newOrg);
            }
            onClose();
        } catch (error) {
            console.error('Error creating organization:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent className="create-quiz-container">
                <ModalHeader>Create Organization</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Organization Name</FormLabel>
                            <Input
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                placeholder="Enter organization name"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter organization description"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Logo</FormLabel>
                            <Input type="file" accept="image/*" onChange={handleLogoChange} />
                            {logoPreview && (
                                <Image
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    boxSize="100px"
                                    objectFit="cover"
                                    mt={2}
                                />
                            )}
                        </FormControl>

                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleCreateOrganization} isLoading={isSubmitting}>
                        Create
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateOrganizationModal;
