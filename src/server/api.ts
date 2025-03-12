import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { ChatAgent } from '../client/chatAgent.js';

// Load environment variables
config();

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
}

interface ChatRequest {
    message: string;
}

// Create a single instance of ChatAgent
const chatAgent = new ChatAgent(OPENAI_API_KEY);

const handleChat = async (req: express.Request, res: express.Response) => {
    try {
        const { message } = req.body as ChatRequest;
        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        const response = await chatAgent.chat(message);
        res.json({ response });
    } catch (error) {
        console.error('Error processing chat request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

router.post('/chat', handleChat);
app.use('/api', router);

const PORT = process.env.PORT || 3001;

export const startServer = async () => {
    return new Promise<void>((resolve) => {
        app.listen(PORT, () => {
            console.log(`API server running on port ${PORT}`);
            resolve();
        });
    });
};

// Start the server if this file is run directly
if (import.meta.url === new URL(import.meta.url).href) {
    app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}`);
    });
} 