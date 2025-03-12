import { config } from 'dotenv';
import { PizzaAgent } from '../client/pizzaAgent.js';

// Load environment variables from .env file
config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please add it to your .env file.');
}

// At this point, we know OPENAI_API_KEY is defined
const apiKey: string = OPENAI_API_KEY;

async function testPizzaAgent() {
    try {
        const agent = new PizzaAgent(apiKey);
        
        console.log('Initializing agent...');
        await agent.initialize();
        
        console.log('Creating and submitting order...');
        let result = await agent.handleRequest('I want a large pepperoni pizza with extra cheese, mushrooms, and olives');
        console.log('Order result:', result);
        
        // Extract order ID from the result
        const orderIdMatch = result.match(/order #([a-z0-9]+)/i);
        const orderId = orderIdMatch ? orderIdMatch[1] : null;
        
        if (orderId) {
            // Remove some toppings
            console.log('\nRemoving toppings...');
            result = await agent.handleRequest(`Please remove mushrooms and olives from order #${orderId}`);
            console.log('Remove toppings result:', result);
            
            // Try to get the pizza delivered with properly formatted address
            console.log('\nRequesting delivery...');
            result = await agent.handleRequest(
                `Please deliver order #${orderId} to this address:
                Street: 123 Main Street
                Unit: Apt 4B
                City: San Francisco
                State: CA
                Zip: 94105
                Instructions: Ring doorbell twice`
            );
            console.log('Delivery result:', result);
        } else {
            console.log('Could not extract order ID from result');
        }
        
        await agent.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

testPizzaAgent(); 