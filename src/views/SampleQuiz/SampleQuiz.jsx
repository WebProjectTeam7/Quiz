import { useState } from 'react';
import { Box, Button, VStack, Text, Radio, RadioGroup, HStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import './SampleQuiz.css';

// add constant questions
const quizQuestions = [
    {
        question: 'Which animal sleeps the most?',
        options: ['Sloth', 'Cat', 'Koala', 'Bat'],
        correctAnswer: 'Koala'
    },
    {
        question: 'If you drop a buttered toast, which side does it land on?',
        options: ['Butter side up', 'Butter side down', 'It levitates', 'Depends on how hungry you are'],
        correctAnswer: 'Butter side down'
    },
    {
        question: 'What do you call a bear with no teeth?',
        options: ['A gummy bear', 'A teddy bear', 'A grizzly bear', 'An unbearable bear'],
        correctAnswer: 'A gummy bear'
    },
    {
        question: 'What happens if you eat too many SpaghettiOs?',
        options: ['You become an O', 'You turn into pasta', 'You feel O-verloaded', 'You become saucy'],
        correctAnswer: 'You feel O-verloaded'
    },
    {
        question: 'Why did the tomato turn red?',
        options: ['Because it saw the salad dressing', 'It was embarrassed', 'It was ripe', 'It wanted to ketchup'],
        correctAnswer: 'Because it saw the salad dressing'
    },
    {
        question: 'Which planet has the most moons?',
        options: ['Saturn', 'Jupiter', 'Uranus', 'Neptune'],
        correctAnswer: 'Saturn'
    },
    {
        question: 'What is the smallest country in the world by land area?',
        options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
        correctAnswer: 'Vatican City'
    },
    {
        question: 'Who was the first woman to win a Nobel Prize?',
        options: ['Marie Curie', 'Jane Addams', 'Rosalind Franklin', 'Ada Lovelace'],
        correctAnswer: 'Marie Curie'
    },
    {
        question: 'What is the capital city of Australia?',
        options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
        correctAnswer: 'Canberra'
    },
    {
        question: 'Which scientist developed the theory of general relativity?',
        options: ['Isaac Newton', 'Albert Einstein', 'Niels Bohr', 'Max Planck'],
        correctAnswer: 'Albert Einstein'
    },
];

export default function SampleQuiz() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);
    const navigate = useNavigate();

    const handleAnswerSelection = (value) => {
        setSelectedAnswer(value);
    };

    const handleNextQuestion = () => {
        const isCorrect = selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer;
        if (isCorrect) {
            setScore(score + 1);
        }

        // eslint-disable-next-line max-len
        setUserAnswers([...userAnswers, { question: quizQuestions[currentQuestionIndex].question, selectedAnswer, isCorrect, correctAnswer: quizQuestions[currentQuestionIndex].correctAnswer }]);

        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer('');
        } else {
            setShowResult(true);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setSelectedAnswer(userAnswers[currentQuestionIndex - 1].selectedAnswer);
        }
    };

    const correctAnswers = userAnswers.filter(answer => answer.isCorrect);
    const incorrectAnswers = userAnswers.filter(answer => !answer.isCorrect);

    const { isOpen: isCorrectOpen, onOpen: onCorrectOpen, onClose: onCorrectClose } = useDisclosure();
    const { isOpen: isIncorrectOpen, onOpen: onIncorrectOpen, onClose: onIncorrectClose } = useDisclosure();

    return  (
        <div>
            <Box className="quiz-container">
                {!showResult ? (
                    <>
                        <Text as='u' className="question-text">{quizQuestions[currentQuestionIndex].question}</Text>
                        <RadioGroup onChange={handleAnswerSelection} value={selectedAnswer}>
                            <VStack align="start">
                                {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                                    <Radio key={index} value={option}>
                                        {option}
                                    </Radio>
                                ))}
                            </VStack>
                        </RadioGroup>
                        <HStack className="button-group">
                            <Button
                                colorScheme="teal"
                                onClick={handlePreviousQuestion}
                                isDisabled={currentQuestionIndex === 0}
                            >
                                Previous
                            </Button>
                            <Button
                                colorScheme="teal"
                                onClick={handleNextQuestion}
                                isDisabled={!selectedAnswer}
                            >
                                {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Show Results'}
                            </Button>
                        </HStack>
                        <button className="back-button" onClick={() => navigate('/')}>Back</button>

                    </>
                ) : (
                    <Box className="results-container">
                        <Text as='u' className="result-text">
                            You scored {score} out of {quizQuestions.length}!
                        </Text>
                        <HStack spacing={8} className="results-columns">
                            <Box className="results-column">
                                <Button colorScheme="green" onClick={onCorrectOpen}>Correct Answers</Button>
                                <Modal isOpen={isCorrectOpen} onClose={onCorrectClose}>
                                    <ModalOverlay />
                                    <ModalContent>
                                        <ModalHeader as='u'>Correct Answers</ModalHeader>
                                        <ModalCloseButton />
                                        <ModalBody>
                                            {correctAnswers.length === 0 ? (
                                                <Text>No correct answers.</Text>
                                            ) : (
                                                correctAnswers.map((answer, index) => (
                                                    <Box key={index} className="result-item">
                                                        <Text className="question-text">{answer.question}</Text>
                                                        <Text className="correct-answer">
                                                            Your answer: {answer.selectedAnswer}
                                                        </Text>
                                                    </Box>
                                                ))
                                            )}
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button colorScheme="teal" onClick={onCorrectClose}>Close</Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
                            </Box>
                            <Box className="results-column">
                                <Button colorScheme="red" onClick={onIncorrectOpen}>Incorrect Answers</Button>
                                <Modal isOpen={isIncorrectOpen} onClose={onIncorrectClose}>
                                    <ModalOverlay />
                                    <ModalContent>
                                        <ModalHeader as='u'>Incorrect Answers</ModalHeader>
                                        <ModalCloseButton />
                                        <ModalBody>
                                            {incorrectAnswers.length === 0 ? (
                                                <Text>No incorrect answers.</Text>
                                            ) : (
                                                incorrectAnswers.map((answer, index) => (
                                                    <Box key={index} className="result-item">
                                                        <Text className="question-text">{answer.question}</Text>
                                                        <Text className="incorrect-answer">
                                                            Your answer: {answer.selectedAnswer}
                                                        </Text>
                                                        <Text className="correct-answer">
                                                            Correct answer: {answer.correctAnswer}
                                                        </Text>
                                                    </Box>
                                                ))
                                            )}
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button colorScheme="teal" onClick={onIncorrectClose}>Close</Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
                            </Box>
                        </HStack>
                        <Button className="back-button" onClick={() => navigate('/')}>
                            Back
                        </Button>
                    </Box>
                )}
            </Box>
        </div>
    );
}
