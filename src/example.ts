import { JokeAgent } from './jokeAgent.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
    // Create a new joke agent with your OpenAI API key
    const jokeAgent = new JokeAgent(process.env.OPENAI_API_KEY!);

    try {
        // Get a random joke
        console.log("Getting a random joke...");
        const randomJoke = await jokeAgent.tellJoke();
        console.log("\nRandom Joke:");
        console.log(`Setup: ${randomJoke.setup}`);
        console.log(`Punchline: ${randomJoke.punchline}`);
        console.log(`Category: ${randomJoke.category}\n`);

        // Get a specific type of joke (e.g., a dad joke)
        console.log("Getting a dad joke...");
        const dadJoke = await jokeAgent.tellJoke("dad joke");
        console.log("\nDad Joke:");
        console.log(`Setup: ${dadJoke.setup}`);
        console.log(`Punchline: ${dadJoke.punchline}`);
        console.log(`Category: ${dadJoke.category}`);
    } catch (error) {
        console.error("Error:", error);
    }
}

main(); 