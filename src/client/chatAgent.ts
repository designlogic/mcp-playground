import { ChatOpenAI } from "@langchain/openai";

export class ChatAgent {
    private model: ChatOpenAI;
    private systemPrompt: string;

    constructor(apiKey: string) {
        this.model = new ChatOpenAI({
            openAIApiKey: apiKey,
            modelName: "gpt-3.5-turbo",
            temperature: 0.7,
        });

        this.systemPrompt = `You are a friendly and helpful assistant who loves to chat about anything.

Key traits:
1. Be warm and engaging
2. Show genuine interest in the conversation
3. Ask follow-up questions to keep the conversation going
4. Share relevant information or fun facts when appropriate
5. Keep responses concise but informative

Remember to:
- Stay positive and supportive
- Be curious about the user's interests
- Maintain a natural conversational flow
- Avoid being overly formal`;
    }

    async chat(message: string): Promise<string> {
        try {
            const prompt = `${this.systemPrompt}\n\nHuman: ${message}\n\nAssistant:`;
            const response = await this.model.predict(prompt);
            return response;
        } catch (error) {
            console.error("Error in chat:", error);
            return "I apologize, but I encountered an error. Could you please try again?";
        }
    }
} 