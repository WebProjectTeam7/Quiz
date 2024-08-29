import { useState } from 'react';
import { sendBugReport } from '../../services/admin.servce';
import { Button, Select } from '@chakra-ui/react';
import PropTypes from 'prop-types';

export default function ReportBugModal({ quizId, questionId, userId, username, onClose }) {
    const [reason, setReason] = useState('Something Else');

    const handleSubmit = async () => {
        try {
            await sendBugReport(quizId, questionId, userId, username, reason);
            onClose();
        } catch (error) {
            console.error('Error reporting bug:', error.message);
        }
    };

    return (
        <div>
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="Wrong Question">Wrong Question</option>
                <option value="Wrong Answer">Wrong Answer</option>
                <option value="Doesn't Work">Doesn't Work</option>
                <option value="Something Else">Something Else</option>
            </Select>
            <Button onClick={handleSubmit}>Submit Report</Button>
        </div>
    );
}

ReportBugModal.propTypes = {
    quizId: PropTypes.string.isRequired,
    questionId: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
};