import { z } from "zod";
declare const jokeSchema: z.ZodObject<{
    setup: z.ZodString;
    punchline: z.ZodString;
    category: z.ZodString;
}, "strip", z.ZodTypeAny, {
    setup: string;
    punchline: string;
    category: string;
}, {
    setup: string;
    punchline: string;
    category: string;
}>;
type JokeType = z.infer<typeof jokeSchema>;
export declare class JokeAgent {
    private openai;
    constructor(apiKey: string);
    tellJoke(category?: string): Promise<JokeType>;
}
export {};
