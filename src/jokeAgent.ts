import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

// Define a schema for joke responses using Zod
// This ensures the AI's responses will have a consistent structure
const jokeSchema = z.object({
    // The setup is the first part of the joke that sets the context
    setup: z.string().describe("The setup line of the joke"),
    
    // The punchline delivers the humorous conclusion
    punchline: z.string().describe("The punchline that makes the joke funny"),
    
    // Category helps classify the type of joke
    category: z.string().describe("The category or type of joke (e.g., 'pun', 'dad joke', 'knock-knock')")
});

// Create a TypeScript type from our Zod schema
// This gives us type safety when working with joke objects
type JokeType = z.infer<typeof jokeSchema>;

// Main JokeAgent class that handles interaction with the AI
export class JokeAgent {
    // Instance of the OpenAI chat model
    private model: ChatOpenAI;
    
    // Parser that ensures AI responses match our joke schema
    private parser: StructuredOutputParser<typeof jokeSchema>;

    // Initialize the agent with an OpenAI API key
    constructor(apiKey: string) {
        // Configure the OpenAI chat model
        this.model = new ChatOpenAI({
            openAIApiKey: apiKey,      // API key for authentication
            modelName: "gpt-3.5-turbo", // Using GPT-3.5 for good performance/cost balance
            temperature: 0.7            // Controls randomness (0 = deterministic, 1 = most random)
        });
        
        // Create a parser from our joke schema
        this.parser = StructuredOutputParser.fromZodSchema(jokeSchema);
    }

    // Method to generate a joke, optionally of a specific category
    async tellJoke(category?: string): Promise<JokeType> {
        // Get formatting instructions for the AI to follow our schema
        const formatInstructions = this.parser.getFormatInstructions();
        
        // Create a system message that sets the AI's behavior
        const systemMessage = new SystemMessage(
            "You are a funny joke-telling AI. Keep all jokes clean and appropriate for all ages."
        );
        
        // Create a human message with the joke request
        const humanMessage = new HumanMessage(
            // If a category is provided, request that specific type of joke
            `Tell me a funny, clean joke. ${category ? `Make it a ${category} joke.` : ""}\n\n${formatInstructions}`
        );

        // Send the messages to the AI and get a response
        const response = await this.model.invoke([systemMessage, humanMessage]);
        
        // Parse the response to ensure it matches our joke schema
        const joke = await this.parser.parse(response.content.toString());
        
        // Return the validated joke
        return joke as JokeType;
    }
} 