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
function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}
// Parse user input to determine their intent
function parseRequest(input) {
    input = input.toLowerCase().trim();
    // Check for exit commands
    if (input === 'exit' || input === 'quit' || input === 'bye' || input === 'goodbye') {
        return { command: 'exit' };
    }
    // Check for help commands
    if (input === 'help' || input === '?' || input === 'commands') {
        return { command: 'help' };
    }
    // Check for specific joke categories
    const categoryMatches = input.match(/(?:tell me |give me |i want )?(?:a |an )?(.*?) joke/i);
    if (categoryMatches) {
        const category = categoryMatches[1].trim();
        return {
            command: 'joke',
            // If they just said "tell me a joke", don't specify a category
            category: category === 'a' || category === '' ? undefined : category
        };
    }
    // If we can't parse the intent, return unknown
    return { command: 'unknown' };
}
async function showHelp() {
    console.log("\n🤖 I understand commands like:");
    console.log("  • tell me a joke");
    console.log("  • tell me a dad joke");
    console.log("  • give me a pun");
    console.log("  • knock knock joke");
    console.log("  • exit/quit");
    console.log("  • help\n");
}
async function main() {
    // Create a new joke agent with your OpenAI API key
    const jokeAgent = new JokeAgent(process.env.OPENAI_API_KEY);
    console.log("\n👋 Hi! I'm your AI Joke Buddy! Ask me to tell you a joke!\n");
    console.log("Type 'help' to see what I can do.\n");
    try {
        while (true) {
            const input = await ask("You: ");
            const request = parseRequest(input);
            switch (request.command) {
                case 'exit':
                    console.log("\n👋 Thanks for laughing with me! Goodbye!\n");
                    return;
                case 'help':
                    await showHelp();
                    break;
                case 'joke':
                    if (request.category) {
                        console.log(`\n🎯 Generating a ${request.category} joke...\n`);
                    }
                    else {
                        console.log("\n🎲 Generating a random joke...\n");
                    }
                    const joke = await jokeAgent.tellJoke(request.category);
                    console.log("🎭 Setup:", joke.setup);
                    console.log("😄 Punchline:", joke.punchline);
                    console.log("📝 Category:", joke.category);
                    console.log();
                    // Optional: Ask if they want to rate the joke
                    const wantToRate = await ask("Would you like to rate this joke? (y/n): ");
                    if (wantToRate.toLowerCase() === 'y') {
                        const rating = await ask("Rate the joke from 1-10: ");
                        console.log(`Thanks for rating! You gave it a ${rating}/10\n`);
                    }
                    else {
                        console.log();
                    }
                    break;
                case 'unknown':
                    console.log("\n❓ I'm not sure what you want. Try asking me to tell you a joke, or type 'help' to see what I can do.\n");
                    break;
            }
        }
    }
    catch (error) {
        console.error("Error:", error);
    }
    finally {
        rl.close();
    }
}
main();
