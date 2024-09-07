import './Quizzes.css';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import Hexagon from '../../components/Hexagon/Hexagon';
import { Popover, PopoverTrigger, Button, Box, Flex, useDisclosure } from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import { getQuizzesByCategory } from '../../services/quiz.service';
import { AppContext } from '../../state/app.context';
import StartQuizModal from '../../components/StartQuizModal/StartQuizModal';

export default function Quizzes() {
    const { userData } = useContext(AppContext);
    const { categoryName } = useParams();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [clickedHexagon, setClickedHexagon] = useState(null);
    const [quizzes, setQuizzes] = useState({ easy: [], medium: [], hard: [], done: [] });
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    useEffect(() => {
        fetchQuizzes();
    }, [categoryName]);

    const fetchQuizzes = async () => {
        try {
            const categoryQuizzes = await getQuizzesByCategory(categoryName);
            const categorizedQuizzes = { easy: [], medium: [], hard: [], done: [] };
            categoryQuizzes.forEach((quiz) => {
                if (quiz.summaries && Object.keys(quiz.summaries).includes(userData.username)) {
                    categorizedQuizzes.done.push(quiz);
                } else {
                    if (quiz.difficulty === 'easy') categorizedQuizzes.easy.push(quiz);
                    if (quiz.difficulty === 'medium') categorizedQuizzes.medium.push(quiz);
                    if (quiz.difficulty === 'hard') categorizedQuizzes.hard.push(quiz);
                }
            });

            setQuizzes(categorizedQuizzes);
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
        }
    };

    const handleHexagonClick = (quizId, level) => {
        const quiz = quizzes[level].find(q => q.id === quizId);
        setSelectedQuiz(quiz);
        setClickedHexagon(`${quizId}-${level}`);
        onOpen();
    };

    const hexagonClass = (quizId, level) => (
        `hexagon ${level} ${clickedHexagon === `${quizId}-${level}` ? 'clicked' : ''} ${level === 'done' ? 'done' : ''}`
    );

    const renderHexagons = (quizzes, level) => (
        <Flex className="hexagon-group" wrap="wrap" gap={4}>
            {quizzes.map((quiz) => (
                <Popover key={quiz.id}>
                    <PopoverTrigger>
                        <NavLink onClick={() => handleHexagonClick(quiz.id, level)}>
                            <Hexagon
                                className={hexagonClass(quiz.id, level)}
                                quiz={quiz}
                                userId={quiz.id}
                            />
                        </NavLink>
                    </PopoverTrigger>
                    {/* <Portal>
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
                    </Portal> */}
                </Popover>
            ))}
        </Flex>
    );

    return (
        <Box className="quizzes-container" padding="20px">
            <Flex className="hexagon-grid" justifyContent="center" wrap="wrap" gap={6}>
                {renderHexagons(quizzes.easy, 'easy')}
                {renderHexagons(quizzes.medium, 'medium')}
                {renderHexagons(quizzes.hard, 'hard')}
                {renderHexagons(quizzes.done, 'done')}
            </Flex>
            <StartQuizModal isOpen={isOpen} onClose={onClose} quiz={selectedQuiz} />

            <Button className="back-button" onClick={() => navigate('/quiz-categories')}>
                Back
            </Button>
        </Box>
    );
}
