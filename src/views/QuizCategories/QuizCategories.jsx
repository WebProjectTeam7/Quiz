/* eslint-disable indent */
// src/pages/Quizzes.js
import './QuizCategories.css';
import { useNavigate } from 'react-router-dom';
import Hexagon from '../../components/Hexagon/Hexagon';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, useDisclosure, Button, Box, Flex
} from '@chakra-ui/react';
import { useState } from 'react';

const categories = [
    'History', 'Geography', 'Science', 'Literature', 'Art and Culture',
    'Sports', 'Music', 'Movies and TV', 'Technology', 'Famous People',
    'Food and Drinks', 'Nature and Animals', 'Logic Puzzles', 'Mythology',
    'Politics', 'Medicine', 'Fashion and Design', 'JavaScript DSA',
    'Space and Astronomy', 'Cultural Traditions'
];

export default function Quizzes() {
    const navigate = useNavigate();
    const [clickedHexagon, setClickedHexagon] = useState(null);
    const [playedHexagons, setPlayedHexagons] = useState({});
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleHexagonClick = (level) => {
        const hexagonKey = `${selectedCategory}-${level}`;
        navigate(`/quizzes/${level}/${selectedCategory}`);
        setClickedHexagon(hexagonKey);
        setPlayedHexagons((prev) => ({ ...prev, [hexagonKey]: true }));
        onClose();
    };

    const hexagonClass = (level) => {
        const hexagonKey = `${selectedCategory}-${level}`;
        return `hexagon ${level} ${clickedHexagon === hexagonKey ? 'clicked' : ''} ${playedHexagons[hexagonKey] ? 'played' : ''}`;
    };

    const openCategoryModal = (category) => {
        setSelectedCategory(category);
        onOpen();
    };

    const renderHexagons = () => (
        <Flex className="hexagon-group-category" wrap="wrap" justify="center" gap={4}>
            {['easy', 'medium', 'hard'].map((level) => (
                <Hexagon
                    key={level}
                    className={hexagonClass(level)}
                    level={level}
                    onClick={() => handleHexagonClick(level)}
                />
            ))}
        </Flex>
    );

    return (
        <div>
            <Button className='all-quizzes-button' onClick={() => navigate('/quizzes')}>ALL QUIZZES</Button>
        <Box className="quizzes-container-category" padding="20px">
            <Flex justifyContent="center" marginBottom="20px" wrap="wrap" gap={4}>
                {categories.map((category) => (
                    <Button key={category} colorScheme="blue" onClick={() => openCategoryModal(category)} className="chakra-button-quiz-categories">
                        {category}
                    </Button>
                ))}
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedCategory}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {renderHexagons()}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
        </div>
    );
}
