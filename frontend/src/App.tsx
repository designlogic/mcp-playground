import { ChakraProvider, Box } from '@chakra-ui/react';
import { ChatInterface } from './components/ChatInterface';

function App() {
  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50">
        <ChatInterface />
      </Box>
    </ChakraProvider>
  );
}

export default App;
