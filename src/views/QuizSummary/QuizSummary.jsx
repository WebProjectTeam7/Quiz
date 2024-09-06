/* eslint-disable react/no-unescaped-entities */
import {
    Box,
    Heading,
    Text,
    Image,
    List,
    ListItem,
    VStack,
    Button,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import './QuizSummary.css';


const QuizSummary = () => {
    const location = useLocation();
    const { summary } = location.state;
    const navigate = useNavigate();

    return (
        <Box maxW="800px" mx="auto" py={8} color="rgb(237, 243, 182)">
            <Heading as="h2" size="lg" mb={4} >
                Quiz Summary for {summary.username}
            </Heading>
            <Text fontSize="lg" mb={2} >
                <strong>Score:</strong> {summary.points}
            </Text>
            <Text fontSize="lg" mb={6} >
                <strong>Date:</strong> {new Date(summary.date).toLocaleString()}
            </Text>

            <VStack spacing={6} align="start">
                {summary.questions.map((q, index) => (
                    <Box key={index} width="100%" p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
                        <Heading as="h3" size="md" mb={2} color="rgb(237, 243, 182)">
                            Question {index + 1}
                        </Heading>
                        <Text mb={2} >
                            <strong>Question Title:</strong> {q.questionText}
                        </Text>
                        {q.description && (
                            <Text mb={2} >
                                <strong>Description:</strong> {q.description}
                            </Text>
                        )}
                        {q.imageUrl && (
                            <Image src={q.imageUrl} alt="Question Image" maxHeight="200px" mb={4} />
                        )}

                        {!q.isOpenEnded ? (
                            <Text mb={2} >
                                <strong>User's Answer:</strong> {q.userAnswer}
                            </Text>
                        ) : (
                            <Box>
                                <Text mb={2} >
                                    <strong>Options:</strong>
                                </Text>
                                <List spacing={2} mb={2}>
                                    {q.options?.map((option, i) => (
                                        <ListItem key={i} p={2} borderWidth="1px" borderRadius="md" >
                                            {option}
                                        </ListItem>
                                    ))}
                                </List>
                                <Text mb={2} >
                                    <strong>User's Answer:</strong> {q.userAnswer}
                                </Text>
                            </Box>
                        )}

                        <Text mb={2} >
                            <strong>Correct Answer:</strong> {q.correctAnswer}
                        </Text>
                        <Text color={q.isCorrect ? 'green.300' : 'red.300'}>
                            <strong>Correct?</strong> {q.isCorrect ? 'Yes' : 'No'}
                        </Text>
                        {q.feedback && (
                            <Text mt={2} color="blue.300">
                                <strong>Feedback:</strong> {q.feedback}
                            </Text>
                        )}
                    </Box>
                ))}
            </VStack>
            <Box display="flex" justifyContent="center" mt={6}>
                <Button onClick={() => navigate('/')}>
                    Go to home page
                </Button>
            </Box>
        </Box>
    );
};

export default QuizSummary;
