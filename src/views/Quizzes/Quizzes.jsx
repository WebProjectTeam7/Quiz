import './Quizzes.css';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import Hexagon from '../../components/Hexagon/Hexagon';
import { Popover, PopoverTrigger, Button, Box, Flex, useDisclosure } from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import { checkIfQuizCompleted, fetchQuizSummary, getQuizzesByCategory } from '../../services/quiz.service';
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

    const handleHexagonClick = async (quizId, level) => {
        const quiz = quizzes[level].find(q => q.id === quizId);

        try {
            const isCompleted = await checkIfQuizCompleted(quizId, userData.username);

            let summary = null;
            if (isCompleted) {
                summary = await fetchQuizSummary(quizId, userData.username);
            }

            setSelectedQuiz({ ...quiz, isCompleted, summary });
            setClickedHexagon(`${quizId}-${level}`);
            onOpen();
        } catch (error) {
            console.error('Error handling hexagon click:', error);
        }
    };

    const hexagonClass = (quizId, level) => (
        `hexagon ${level} ${clickedHexagon === `${quizId}-${level}` ? 'clicked' : ''} ${level === 'done' ? 'done' : ''}`
    );

    const renderHexagons = (quizzes, level) => (
        <Flex className="hexagon-group" wrap="wrap" gap={4}>
            {quizzes.map((quiz) => (
                <Popover key={quiz.id}>
                    <PopoverTrigger>
                        <NavLink>
                            <Hexagon
                                className={hexagonClass(quiz.id, level)}
                                quiz={quiz}
                                userId={quiz.id}
                                level={level}
                                onClick={() => handleHexagonClick(quiz.id, level)}
                            />
                        </NavLink>
                    </PopoverTrigger>
                </Popover>
            ))}
        </Flex>
    );

    return (
        <Box className="quizzes-container">
            <div className="difficulty-level">Difficulty Level</div>
            <div className="hexagon-grid">
                <div className="hexagon-row">
                    <div className="hexagon-column">
                        <div className="category-title">EASY</div>
                        {renderHexagons(quizzes.easy, 'easy')}
                    </div>
                    <div className="hexagon-column">
                        <div className="category-title">MEDIUM</div>
                        {renderHexagons(quizzes.medium, 'medium')}
                    </div>
                    <div className="hexagon-column">
                        <div className="category-title">HARD</div>
                        {renderHexagons(quizzes.hard, 'hard')}
                    </div>
                </div>
                <div className="category-title completed">Completed Quizzes</div>
                {renderHexagons(quizzes.done, 'done')}
            </div>
            <StartQuizModal isOpen={isOpen} onClose={onClose} quiz={selectedQuiz} />
            <Button className="back-button" onClick={() => navigate('/quiz-categories')}>
                Back
            </Button>
        </Box>
    );
}
