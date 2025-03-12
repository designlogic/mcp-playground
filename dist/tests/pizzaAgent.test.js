import { config } from 'dotenv';
import { PizzaAgent } from '../client/pizzaAgent.js';
// Load environment variables from .env file
config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please add it to your .env file.');
}
// At this point, we know OPENAI_API_KEY is defined
const apiKey = OPENAI_API_KEY;
async function testPizzaAgent() {
    try {
        const agent = new PizzaAgent(apiKey);
        console.log('Initializing agent...');
        await agent.initialize();
        console.log('Creating and submitting order...');
        let result = await agent.handleRequest('I want a large pepperoni pizza with extra cheese');
        console.log('Order result:', result);
        // Try to get the pizza delivered
        console.log('\nRequesting delivery...');
        result = await agent.handleRequest('Please deliver my pizza to 123 Main St, Apt 4B');
        console.log('Delivery result:', result);
        await agent.disconnect();
    }
    catch (error) {
        console.error('Error:', error);
    }
}
testPizzaAgent();
