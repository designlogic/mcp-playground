import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

export class ChatAgent {
    private model: ChatOpenAI;
    private systemPrompt: string;
    private messageHistory: BaseMessage[] = [];

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
- Avoid being overly formal
- Reference previous parts of the conversation when relevant`;
    }

    async chat(message: string): Promise<string> {
        try {
            // Construct messages array with system message and history
            const messages = [
                new SystemMessage(this.systemPrompt),
                ...this.messageHistory.slice(-10), // Keep last 5 exchanges (10 messages)
                new HumanMessage(message)
            ];

            // Get response from the model
            const response = await this.model.invoke(messages);
            const responseContent = response.content as string;

            // Save messages to history
            this.messageHistory.push(new HumanMessage(message));
            this.messageHistory.push(new AIMessage(responseContent));

            // Trim history if it gets too long
            if (this.messageHistory.length > 20) {
                this.messageHistory = this.messageHistory.slice(-20);
            }

            return responseContent;
        } catch (error) {
            console.error("Error in chat:", error);
            throw error; // Let the API handle the error response
        }
    }
} 