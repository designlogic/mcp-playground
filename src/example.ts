import { JokeAgent } from './jokeAgent.js';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

// Load environment variables
dotenv.config();

// Create readline interface for terminal interaction
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify the question method
function ask(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function main() {
    // Create a new joke agent with your OpenAI API key
    const jokeAgent = new JokeAgent(process.env.OPENAI_API_KEY!);

    console.log("\nWelcome to the AI Joke Generator! 😄\n");
    
    try {
        while (true) {
            console.log("Options:");
            console.log("1. Tell me a random joke");
            console.log("2. Tell me a specific type of joke");
            console.log("3. Exit");
            
            const choice = await ask("\nWhat would you like to do? (1-3): ");

            if (choice === "3") {
                console.log("\nThanks for laughing with me! Goodbye! 👋\n");
                break;
            }

            let joke;
            if (choice === "1") {
                console.log("\nGenerating a random joke...\n");
                joke = await jokeAgent.tellJoke();
            } else if (choice === "2") {
                const category = await ask("\nWhat type of joke would you like? (e.g., 'dad joke', 'pun', 'knock-knock'): ");
                console.log(`\nGenerating a ${category}...\n`);
                joke = await jokeAgent.tellJoke(category);
            } else {
                console.log("\nInvalid choice. Please select 1, 2, or 3.\n");
                continue;
            }

            if (joke) {
                console.log("🎭 Setup:", joke.setup);
                console.log("😄 Punchline:", joke.punchline);
                console.log("📝 Category:", joke.category);
                console.log(); // Empty line for spacing
            }

            // Optional: Ask if they want to rate the joke
            const wantToRate = await ask("Would you like to rate this joke? (y/n): ");
            if (wantToRate.toLowerCase() === 'y') {
                const rating = await ask("Rate the joke from 1-10: ");
                console.log(`Thanks for rating! You gave it a ${rating}/10\n`);
            } else {
                console.log(); // Empty line for spacing
            }
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        rl.close();
    }
}

main(); 