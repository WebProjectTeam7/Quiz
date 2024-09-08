/* eslint-disable consistent-return */
import { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../../state/app.context';
import { chatCleanUp, getChatMessages, sendMessage } from '../../services/chat.service';
import {
    Box,
    VStack,
    Text,
    Textarea,
    Button,
    Flex,
    useToast,
    HStack,
    Divider,
} from '@chakra-ui/react';
import StatusAvatar from '../StatusAvatar/StatusAvatar';
import { getUserByUsername } from '../../services/user.service';
import { CHAT_COMMENTS_LIMIT } from '../../common/components.constants';

const ChatComponent = () => {
    const { userData } = useContext(AppContext);
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const toast = useToast();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    scrollToBottom();

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const unsubscribe = getChatMessages(async (messages) => {
                if (messages.length > CHAT_COMMENTS_LIMIT) {
                    await chatCleanUp(CHAT_COMMENTS_LIMIT);
                }
                setChatMessages(messages);
            });

            scrollToBottom();
            return () => {
                if (unsubscribe) unsubscribe();
            };
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (message.trim()) {
            try {
                await sendMessage(userData.username, message);
                setMessage('');
                scrollToBottom();
            } catch (error) {
                toast({
                    title: 'Error sending message',
                    description: error.message,
                    status: 'error',
                    isClosable: true,
                });
            }
        }
    };

    const loadUserData = async (username) => {
        try {
            const userInfo = await getUserByUsername(username);
            return {
                uid: userInfo?.uid || 'unknown',
                avatar: userInfo?.avatar || userInfo?.avatarUrl || '',
                onlineStatus: userInfo?.onlineStatus || 'offline',
            };
        } catch (error) {
            console.error(error);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <Box
            bottom={0}
            left={0}
            right={0}
            p={4}
            border="1px"
            borderColor="gray.300"
            borderRadius="md"
            bg="white"
            width="1000px"
            maxW="2000px"
            height="60vh"
            mx="auto"
            boxShadow="lg"
            display="flex"
            flexDirection="column"
        >
            <Box
                flex="1"
                overflowY="auto"
                overflowX="hidden"
                p={4}
                bg="gray.50"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
            >
                <VStack align="stretch" spacing={4}>
                    {chatMessages.map((msg, index) => {
                        const isCurrentUser = msg.sender === (userData && userData.username);
                        const user = isCurrentUser ? userData : loadUserData(msg.sender);
                        return (
                            <Flex
                                key={index}
                                justify={isCurrentUser ? 'flex-start' : 'flex-end'}
                                w="100%"
                            >
                                <HStack
                                    maxW="70%"
                                    spacing={3}
                                    alignItems="flex-start"
                                    p={3}
                                    border="1px"
                                    borderColor={isCurrentUser ? 'blue.300' : 'gray.300'}
                                    borderRadius="lg"
                                    bg={isCurrentUser ? 'blue.100' : 'gray.100'}
                                    align="center"
                                    wordBreak="break-word"
                                >
                                    {isCurrentUser && (
                                        <StatusAvatar uid={user.uid} src={user.avatar || user.avatarUrl || ''} size="lg" />
                                    )}
                                    <Box>
                                        <Text fontWeight="bold" color={isCurrentUser ? 'blue.600' : 'gray.700'}>
                                            {msg.sender}
                                        </Text>
                                        <Text color="gray.800">{msg.text}</Text>
                                        <Text fontSize="sm" color="gray.500">
                                            {formatTimestamp(msg.timestamp)}
                                        </Text>
                                    </Box>
                                    {!isCurrentUser && (

                                        < StatusAvatar uid={user.uid} src={user.avatar || user.avatarUrl || ''} size="lg" />

                                    )}
                                </HStack>
                            </Flex>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </VStack>
            </Box>

            <Divider mt={4} />

            <Box mt={4} position="sticky" bottom={0} bg="white">
                <Textarea
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    resize="none"
                    bg="white"
                    color="black"
                />
                <Button
                    mt={2}
                    colorScheme="blue"
                    onClick={handleSendMessage}
                >
                    Send
                </Button>
            </Box>
        </Box>
    );
};

export default ChatComponent;
