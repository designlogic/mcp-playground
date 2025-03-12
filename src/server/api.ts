import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ChatAgent } from '../client/chatAgent.js';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

// Initialize chat agent
const chatAgent = new ChatAgent();

// Chat endpoint
app.post('/api/chat', express.json(), async (req: Request, res: Response): Promise<void> => {
    try {
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        const response = await chatAgent.chat(message);
        res.json({ response });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Clear chat history endpoint
app.post('/api/clear', express.json(), async (req: Request, res: Response): Promise<void> => {
    try {
        await chatAgent.clearHistory();
        res.json({ message: 'Chat history cleared' });
    } catch (error) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export const startServer = async () => {
    return new Promise<void>((resolve) => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            resolve();
        });
    });
};

// Start the server if this file is run directly
if (import.meta.url === new URL(import.meta.url).href) {
    startServer();
} 