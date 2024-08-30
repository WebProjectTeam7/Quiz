/* eslint-disable indent */
// src/pages/Quizzes.js
import './Quizzes.css';
import { useNavigate } from 'react-router-dom';
import Hexagon from '../../components/Hexagon/Hexagon';
import { Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverHeader, PopoverCloseButton, PopoverFooter, Portal, Button, Box, Flex, PopoverBody } from '@chakra-ui/react';
import { useState } from 'react';

export default function Quizzes() {
    const navigate = useNavigate();
    const [clickedHexagon, setClickedHexagon] = useState(null);

    const handleHexagonClick = (userId, level) => {
        navigate(`/quizzes/${level}/${userId}`);
        setClickedHexagon(`${userId}-${level}`);
        setTimeout(() => setClickedHexagon(null), 200);
    };

    const hexagonClass = (userId, level) => (
        `hexagon ${level} ${clickedHexagon === `${userId}-${level}` ? 'clicked' : ''}`
    );

    return (
        <Box className="quizzes-container" padding="20px">
        <Flex justifyContent="center" marginBottom="20px" gap={4}>
            <Button colorScheme="blue" onClick={() => navigate('/quiz-of-the-week')}>Quiz of the Week</Button>
        </Flex>

        <Flex className="hexagon-grid" justifyContent="center" wrap="wrap" gap={6}>

            {/* Easy Hexagons */}
            <Flex className="hexagon-group" wrap="wrap" gap={4}>
                {['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7'].map((userId) => (
                    <Popover key={userId}>
                        <PopoverTrigger>
                            <Hexagon className={hexagonClass(userId, 'easy')}level="easy" userId={userId} onClick={() => handleHexagonClick(userId, 'easy')} />
                        </PopoverTrigger>
                        <Portal>
                            <PopoverContent>
                                <PopoverArrow />
                                <PopoverHeader>Select Option</PopoverHeader>
                                <PopoverCloseButton />
                                <PopoverBody>
                                    <Button colorScheme="blue" width="full" onClick={() => navigate('/quiz-of-the-week')}>Quiz of the Week</Button>
                                    <Button colorScheme="blue" width="full" onClick={() => navigate('/ranking')} marginTop={2}>Ranking</Button>
                                    <Button colorScheme="blue" width="full" onClick={() => navigate('/tournaments')} marginTop={2}>Tournament</Button>
                                </PopoverBody>
                                <PopoverFooter>Choose an option to proceed</PopoverFooter>
                            </PopoverContent>
                        </Portal>
                    </Popover>
                ))}
            </Flex>

            {/* Medium Hexagons */}
            <Flex className="hexagon-group" wrap="wrap" gap={4}>
                {['user8', 'user9', 'user10', 'user11', 'user12', 'user13', 'user14'].map((userId) => (
                    <Popover key={userId}>
                        <PopoverTrigger>
                            <Hexagon className={hexagonClass(userId, 'medium')} level="medium" userId={userId} onClick={() => handleHexagonClick(userId, 'medium')} />
                        </PopoverTrigger>
                        <Portal>
                            <PopoverContent>
                                <PopoverArrow />
                                <PopoverHeader>Select Option</PopoverHeader>
                                <PopoverCloseButton />
                                <PopoverBody>
                                    <Button colorScheme="blue" width="full" onClick={() => navigate('/quiz-of-the-week')}>Quiz of the Week</Button>
                                    <Button colorScheme="blue" width="full" onClick={() => navigate('/ranking')} marginTop={2}>Ranking</Button>
                                    <Button colorScheme="blue" width="full" onClick={() => navigate('/tournaments')} marginTop={2}>Tournament</Button>
                                </PopoverBody>
                                <PopoverFooter>Choose an option to proceed</PopoverFooter>
                            </PopoverContent>
                        </Portal>
                    </Popover>
                ))}
            </Flex>

            {/* Hard Hexagons */}
            <Flex className="hexagon-group" wrap="wrap" gap={4}>
                {['user15', 'user16', 'user17', 'user18', 'user19', 'user20', 'user21'].map((userId) => (
                    <Popover key={userId}>
                        <PopoverTrigger>
                            <Hexagon className={hexagonClass(userId, 'hard')} level="hard" userId={userId} onClick={() => handleHexagonClick(userId, 'hard')} />
                        </PopoverTrigger>
                        <Portal>
                            <PopoverContent>
                                <PopoverArrow />
                                <PopoverHeader>Select Option</PopoverHeader>
                            <PopoverCloseButton />
                                <PopoverBody>
                                    <Button colorScheme="blue" width="full" onClick={() => navigate('/quiz-of-the-week')}>Quiz of the Week</Button>
                                    <Button colorScheme="blue" width="full" onClick={() => navigate('/ranking')} marginTop={2}>Ranking</Button>
                                    <Button colorScheme="blue" width="full" onClick={() => navigate('/tournaments')} marginTop={2}>Tournament</Button>
                                </PopoverBody>
                                <PopoverFooter>Choose an option to proceed</PopoverFooter>
                            </PopoverContent>
                        </Portal>
                    </Popover>
                ))}
            </Flex>
        </Flex>
        <button className="back-button" onClick={() => navigate('/quiz-categories')}>
                Back
            </button>
    </Box>
    );
}
