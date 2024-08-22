/* eslint-disable spaced-comment */
/* eslint-disable indent */
import { useState, useEffect } from 'react';
import { Box, Button, Flex, Text, useToast, Spinner } from '@chakra-ui/react';
import { ref, get } from 'firebase/database';
import { db } from '../../config/firebase-config';
import './Tournament.css';
import { useNavigate } from 'react-router-dom';

export default function Tournament() {
  const [players, setPlayers] = useState([]);
  const [tournamentGroup, setTournamentGroup] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [isTournamentStarted, setIsTournamentStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        usersArray.sort((a, b) => b.points - a.points);
        setPlayers(usersArray);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomQuiz = async () => {
    try {
      const response = await fetch(''); // will add the path after create all quizzes
      const quizzes  = await response.json();
      const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
      setQuiz(randomQuiz.title);
    } catch (error) {
      console.error('Error fetching random quiz:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const startTournament = () => {
    const group = players.slice(0, 4);
    setTournamentGroup(group);
    fetchRandomQuiz();
    setIsTournamentStarted(true);
  };

  const handleQuizStart = () => {
    toast({
      title: 'Quiz started!',
      description: 'You have started the assigned quiz.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box className="tournament-container">
      {!isTournamentStarted && (
        <Button colorScheme="blue" onClick={startTournament}>Start Game</Button>
      )}

      {isTournamentStarted && tournamentGroup && (
        <Box className="tournament-details">
          <Text className="tournament-title">Are you ready?</Text>
          <Flex className="players-list">
            {tournamentGroup.map((player) => (
              <Box key={player.id}
              className="player-card"
              data-index={tournamentGroup.indexOf(player) + 1}>
                {player.username}
              </Box>
            ))}
          </Flex>
          <Text className="quiz-title">Assigned Quiz: Трябва да се добави съответния куиз{/*{quiz ? quiz : 'Loading...'}*/}</Text>
          <Button colorScheme="teal" onClick={handleQuizStart}>Start</Button>
          <Button colorScheme="red" onClick={() => navigate('/tournament')} mt={4}>
            Back
          </Button>
        </Box>
      )}
    </Box>
  );
}
