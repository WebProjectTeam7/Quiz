import { ButtonGroup, Flex, IconButton, useEditableControls } from '@chakra-ui/react';
import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';

const EditableControls = () => {
    const {
        isEditing,
        getSubmitButtonProps,
        getCancelButtonProps,
        getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
        <ButtonGroup justifyContent="center" size="sm">
            <IconButton icon={<CheckIcon />} {...getSubmitButtonProps()} />
            <IconButton icon={<CloseIcon />} {...getCancelButtonProps()} />
        </ButtonGroup>
    ) : (
        <Flex justifyContent="center">
            <IconButton size="sm" icon={<EditIcon />} {...getEditButtonProps()} />
        </Flex>
    );
};

export default EditableControls;
