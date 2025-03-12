import OpenAI from 'openai';
import { z } from "zod";

// Define schema for joke responses using Zod
const jokeSchema = z.object({
    setup: z.string().describe("The setup line of the joke"),
    punchline: z.string().describe("The punchline that makes the joke funny"),
    category: z.string().describe("The category or type of joke (e.g., 'pun', 'dad joke', 'knock-knock')")
});

// Create a TypeScript type from our Zod schema
type JokeType = z.infer<typeof jokeSchema>;

// Main JokeAgent class that handles interaction with the AI
export class JokeAgent {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    async tellJoke(category?: string): Promise<JokeType> {
        const response = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "system",
                    content: "You are a funny joke-telling AI. Keep all jokes clean and appropriate for all ages."
                },
                {
                    role: "user",
                    content: `Tell me a funny, clean joke${category ? ` in the category: ${category}` : ""}. Respond ONLY with a JSON object matching this schema:
                    {
                        "setup": "string - the setup line of the joke",
                        "punchline": "string - the punchline that makes the joke funny",
                        "category": "string - the category or type of joke"
                    }`
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response content from OpenAI");
        }

        const jokeData = JSON.parse(content);
        return jokeSchema.parse(jokeData);
    }
} 