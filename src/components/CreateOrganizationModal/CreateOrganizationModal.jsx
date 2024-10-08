import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
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
import { createOrganization } from '../../services/organization.service';
import './CreateOrganizationModal.css';
import { AppContext } from '../../state/app.context';
import { updateUserWithOrganization } from '../../services/user.service';

export default function CreateOrganizationModal({ isOpen, onClose, onOrganizationCreated }) {
    const { userData } = useContext(AppContext);

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
                founder: userData.username,
                admin: userData.username,
                logo: logo ? logo : null,
            };
            const newOrg = await createOrganization(organization);
            await updateUserWithOrganization(userData.uid, organization.id, organization.name);
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
}

CreateOrganizationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onOrganizationCreated: PropTypes.func,
};

