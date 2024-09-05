/* eslint-disable consistent-return */
import {
    Box,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Divider,
    Spinner,
} from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/app.context';
import { getQuizById } from '../../services/quiz.service';
import { getQuestionById } from '../../services/question.service';
import Swal from 'sweetalert2';
import QuestionView from '../../components/QuestionView/QuestionView';
import UserRoleEnum from '../../common/role-enum';
import { updateUser } from '../../services/user.service';

export default function PlayQuiz() {
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();

    const { field, setField } = useState([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);



    return {
        
    }


}
