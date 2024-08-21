import { HStack, Button, Text, Input } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const [pageInput, setPageInput] = useState('');

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageInputChange = (e) => {
        const value = e.target.value;
        if (!isNaN(value) && value > 0 && value <= totalPages) {
            setPageInput(value);
        }
    };

    const handleGoToPage = () => {
        const page = parseInt(pageInput, 10);
        if (page && page >= 1 && page <= totalPages) {
            onPageChange(page);
            setPageInput('');
        }
    };


    return (
        <HStack spacing={4} justify="center" mt={4}>
            <Button
                onClick={handlePrevious}
                isDisabled={currentPage === 1}
                colorScheme="blue"
            >
                Previous
            </Button>
            <Text>Page {currentPage} of {totalPages}</Text>
            <Input
                value={pageInput}
                onChange={handlePageInputChange}
                placeholder="Page"
                width="70px"
            />
            <Button onClick={handleGoToPage} colorScheme="blue">
                Go
            </Button>
            <Button
                onClick={handleNext}
                isDisabled={currentPage === totalPages}
                colorScheme="blue"
            >
                Next
            </Button>
        </HStack>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
