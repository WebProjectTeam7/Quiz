import './Quizzes.css';
import Swal from 'sweetalert2';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import Hexagon from '../../components/Hexagon/Hexagon';
import { Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverHeader, PopoverCloseButton, PopoverFooter, Portal, Button, Box, Flex, PopoverBody } from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import { getQuizzesByCategory } from '../../services/quiz.service';
import { AppContext } from '../../state/app.context';

export default function Quizzes() {
    const { userData } = useContext(AppContext);
    const { categoryName } = useParams();
    const navigate = useNavigate();

    const [clickedHexagon, setClickedHexagon] = useState(null);
    const [quizzes, setQuizzes] = useState({ easy: [], medium: [], hard: [], done: [] });

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
        if (level === 'done') {
            Swal.fire({
                icon: 'info',
                title: 'Quiz Completed',
                text: 'You have already completed this quiz!',
                confirmButtonText: 'OK'
            });
        } else {
            Swal.fire({
                title: 'Are you sure?',
                text: 'You will have only one chance to complete this quiz.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, start the quiz!'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate(`/play-quiz/${quizId}`);
                }
            });
        }

        setClickedHexagon(`${quizId}-${level}`);
        setTimeout(() => setClickedHexagon(null), 200);
    };


    // const hexagonClass = (quizId, level) => (
    //     `hexagon ${level} ${clickedHexagon === `${quizId}-${level}` ? 'clicked' : ''}`
    // );

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

            <Button className="back-button" onClick={() => navigate('/quiz-categories')}>
                Back
            </Button>
        </Box>
    );
}
