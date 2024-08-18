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
import { useContext, useState } from 'react';
import { AppContext } from '../../state/app.context';
import Swal from 'sweetalert2';
import propTypes from 'prop-types';
import './CreateQuestion.css';
import QuizAccessEnum from '../../common/access-enum';
import { createQuestion } from '../../services/question.service';

export default function CreateQuestion({ isVisible, onClose }) {
    const { userData } = useContext(AppContext);
    const [question, setQuestion] = useState({
        author: '',
        title: '',
        imageFile: null,
        description: '',
        options: [],
        answer: '',
        points: 0,
        category: '',
        access: QuizAccessEnum.PUBLIC,
        timeAmplifier: 1
    });

    const [loading, setLoading] = useState(false);

    const updateQuestion = (prop) => (e) => {
        setQuestion({
            ...question,
            [prop]: e.target.value,
        });
    };

    const register = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createQuestion(question);
            Swal.fire({
                icon: 'success',
                title: 'Question Created',
                text: 'You have successfully created a question.',
                confirmButtonText: 'OK',
            });

            setQuestion({
                author: '',
                title: '',
                image: null,
                description: '',
                options: [],
                answer: '',
                points: 0,
                category: '',
                access: QuizAccessEnum.PUBLIC,
                timeAmplifier: 1
            });

            onClose();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Creation Error',
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
                <ModalHeader>Create Question</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <form onSubmit={register}>

                        <FormControl id="title" isRequired>
                            <FormLabel>Title</FormLabel>
                            <Input
                                value={question.title}
                                onChange={updateQuestion('title')}
                                type="text"
                            />
                        </FormControl>

                        <FormControl id="description" isRequired>
                            <FormLabel>Description</FormLabel>
                            <Input
                                value={question.description}
                                onChange={updateQuestion('description')}
                                type="text"
                            />
                        </FormControl>

                        <FormControl id="category" isRequired>
                            <FormLabel>Category</FormLabel>
                            <Input
                                value={question.category}
                                onChange={updateQuestion('category')}
                                type="text"
                            />
                        </FormControl>

                        <FormControl id="points" isRequired>
                            <FormLabel>Points</FormLabel>
                            <Input
                                value={question.points}
                                onChange={updateQuestion('points')}
                                type="number"
                            />
                        </FormControl>

                        <ModalFooter>
                            <Button
                                colorScheme="blue"
                                type="submit"
                                isLoading={loading}
                            >
                                Create
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

CreateQuestion.propTypes = {
    isVisible: propTypes.bool.isRequired,
    onClose: propTypes.func.isRequired,
};
