/* eslint-disable indent */
/* eslint-disable quotes */
// src/components/Tournament/Tournament.js
import { useState, useEffect } from 'react';
import { Box, Button, Flex, Text, useToast } from '@chakra-ui/react';
import './Tournament.css';
import { Navigate } from 'react-router-dom';

export default function Tournament() {
  const [players, setPlayers] = useState([]);
  const [tournamentGroup, setTournamentGroup] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [isTournamentStarted, setIsTournamentStarted] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchedPlayers = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'];
    setPlayers(fetchedPlayers);
  }, []);

  const fetchRandomQuiz = () => {
    const quizzes = ['Quiz A', 'Quiz B', 'Quiz C', 'Quiz D'];
    const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    setQuiz(randomQuiz);
  };

  const startTournament = () => {
    const group = players.slice(0, 4);
    setTournamentGroup(group);
    fetchRandomQuiz();
    setIsTournamentStarted(true);
  };

  const handleQuizStart = () => {
    toast({
      title: "Quiz started!",
      description: "You have started the assigned quiz.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return  (
        <Box className="tournament-container">
          {!isTournamentStarted && (
            <Button colorScheme="blue" onClick={startTournament}>Start Tournament</Button>
          )}

          {isTournamentStarted && tournamentGroup && (
            <Box className="tournament-details">
              <Text className="tournament-title">Are you ready?</Text>
              <Flex className="players-list">
                {tournamentGroup.map((player, index) => (
                  <Box key={index} className="player-card">
                    {player}
                  </Box>
                ))}
              </Flex>
              <Text className="quiz-title">Assigned Quiz: {quiz}</Text>
              <Button colorScheme="teal" onClick={handleQuizStart}>Start</Button>
              <Button colorScheme="red" onClick={() => Navigate('/quizzes')} mt={4}>
                Back
              </Button>
            </Box>
          )}
        </Box>
      );
}
