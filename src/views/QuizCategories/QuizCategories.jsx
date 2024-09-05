import './QuizCategories.css';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Heading, Flex } from '@chakra-ui/react';
import QuizCategoryEnum from '../../common/category-enum';

export default function QuizzesCategories() {
    const categories = Object.values(QuizCategoryEnum);
    const navigate = useNavigate();

    const handleCategoryClick = (category) => {
        navigate(`/quizzes/${category}`);
    };

    return (
        <div>
            <Flex justifyContent="center" marginBottom="20px" gap={4}>
                <Button colorScheme="blue" onClick={() => navigate('/quiz-of-the-week')}>Quiz of the Week</Button>
            </Flex>
            <Heading as="h2" size="lg" textAlign="center" marginBottom="20px" color='white'>
                Select a Category
            </Heading>
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4}>
                {categories.map((category) => (
                    <Button
                        key={category}
                        colorScheme="blue"
                        onClick={() => handleCategoryClick(category)}
                        className="chakra-button-quiz-categories"
                    >
                        {category}
                    </Button>
                ))}
            </Box>
        </div>
    );
}
