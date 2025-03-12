import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

// Define the structure for our joke output
const jokeSchema = z.object({
    setup: z.string().describe("The setup line of the joke"),
    punchline: z.string().describe("The punchline that makes the joke funny"),
    category: z.string().describe("The category or type of joke (e.g., 'pun', 'dad joke', 'knock-knock')")
});

type JokeType = z.infer<typeof jokeSchema>;

export class JokeAgent {
    private model: ChatOpenAI;
    private parser: StructuredOutputParser<typeof jokeSchema>;

    constructor(apiKey: string) {
        this.model = new ChatOpenAI({
            openAIApiKey: apiKey,
            modelName: "gpt-3.5-turbo",
            temperature: 0.7
        });
        this.parser = StructuredOutputParser.fromZodSchema(jokeSchema);
    }

    async tellJoke(category?: string): Promise<JokeType> {
        const formatInstructions = this.parser.getFormatInstructions();
        
        const systemMessage = new SystemMessage(
            "You are a funny joke-telling AI. Keep all jokes clean and appropriate for all ages."
        );
        
        const humanMessage = new HumanMessage(
            `Tell me a funny, clean joke. ${category ? `Make it a ${category} joke.` : ""}\n\n${formatInstructions}`
        );

        const response = await this.model.invoke([systemMessage, humanMessage]);
        const joke = await this.parser.parse(response.content.toString());
        
        return joke as JokeType;
    }
} 