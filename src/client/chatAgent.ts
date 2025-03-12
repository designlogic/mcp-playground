import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { BufferMemory } from "langchain/memory";
import { BaseChatMessageHistory } from "@langchain/core/chat_history";

export class ChatAgent {
    private model: ChatOpenAI;
    private systemPrompt: string;
    private memory: BufferMemory;

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

        this.memory = new BufferMemory({
            memoryKey: "chat_history",
            returnMessages: true,
            inputKey: "input",
            outputKey: "output",
            humanPrefix: "Human",
            aiPrefix: "Assistant"
        });
    }

    async chat(message: string): Promise<string> {
        try {
            // Get chat history
            const memoryVariables = await this.memory.loadMemoryVariables({});
            const chatHistory = memoryVariables.chat_history || [];

            // Construct messages array with system message and history
            const messages = [
                new SystemMessage(this.systemPrompt),
                ...chatHistory,
                new HumanMessage(message)
            ];

            // Get response from the model
            const response = await this.model.invoke(messages);
            const responseContent = response.content as string;

            // Save the interaction to memory
            await this.memory.saveContext(
                { input: message },
                { output: responseContent }
            );

            return responseContent;
        } catch (error) {
            console.error("Error in chat:", error);
            throw error; // Let the API handle the error response
        }
    }
} 