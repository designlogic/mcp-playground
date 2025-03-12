import { Box, Text, Avatar } from '@chakra-ui/react';
import { FaRobot, FaUser } from 'react-icons/fa';

interface ChatMessageProps {
    message: string;
    isUser: boolean;
}

export const ChatMessage = ({ message, isUser }: ChatMessageProps) => {
    return (
        <Box
            display="flex"
            alignItems="flex-start"
            gap={2}
            flexDirection={isUser ? 'row-reverse' : 'row'}
        >
            <Avatar
                icon={isUser ? <FaUser /> : <FaRobot />}
                bg={isUser ? 'blue.500' : 'gray.500'}
                color="white"
                size="sm"
            />
            <Box
                bg={isUser ? 'blue.500' : 'gray.100'}
                color={isUser ? 'white' : 'black'}
                px={4}
                py={2}
                borderRadius="lg"
                maxW="80%"
            >
                <Text>{message}</Text>
            </Box>
        </Box>
    );
} 