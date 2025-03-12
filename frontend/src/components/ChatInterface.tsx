import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Flex,
    Input,
    IconButton,
    Stack,
    Container,
    useToast,
    Text,
} from '@chakra-ui/react';
import { FaPaperPlane } from 'react-icons/fa';
import { ChatMessage } from './ChatMessage';
import { sendMessage } from '../api/chatApi';

interface Message {
    text: string;
    isUser: boolean;
}

export const ChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hi! I'm your friendly AI assistant. I'd love to chat about any topic you're interested in. What's on your mind?", isUser: false }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const focusInput = () => {
        // Small delay to ensure focus happens after state updates
        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input on initial load
    useEffect(() => {
        focusInput();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Add user message
        const userMessage = { text: input, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await sendMessage(input);
            const botResponse = { text: response, isUser: false };
            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Error processing request:', error);
            toast({
                title: 'Error',
                description: 'Failed to process your request. Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
            focusInput();
        }
    };

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // If Escape is pressed, focus the input
            if (e.key === 'Escape') {
                focusInput();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <Container maxW="container.md" py={8}>
                <Box
                    bg="white"
                    borderRadius="xl"
                    boxShadow="lg"
                    overflow="hidden"
                    h="600px"
                    display="flex"
                    flexDirection="column"
                >
                    <Box flex="1" overflowY="auto" p={4}>
                        <Stack direction="column" spacing={4}>
                            {messages.map((msg, idx) => (
                                <ChatMessage
                                    key={idx}
                                    message={msg.text}
                                    isUser={msg.isUser}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </Stack>
                    </Box>

                    <Box p={4} borderTop="1px" borderColor="gray.200">
                        <form onSubmit={handleSubmit}>
                            <Flex gap={2}>
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    size="lg"
                                    disabled={isLoading}
                                />
                                <IconButton
                                    colorScheme="blue"
                                    aria-label="Send message"
                                    icon={<FaPaperPlane />}
                                    size="lg"
                                    type="submit"
                                    isLoading={isLoading}
                                    variant="solid"
                                />
                            </Flex>
                        </form>
                    </Box>
                </Box>
            </Container>
        </>
    );
}; 