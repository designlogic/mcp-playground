import { ChatOpenAI } from "@langchain/openai";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

export class ChatAgent {
    private model: ChatOpenAI;
    private messageHistory: ChatMessageHistory;
    private chain: any;

    constructor() {
        // Initialize the Chat model using your API key from the .env file
        this.model = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0, // Using 0 for more deterministic responses
        });

        this.messageHistory = new ChatMessageHistory();

        // Create a chat prompt template
        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                "You are a helpful assistant. Answer all questions to the best of your ability.",
            ],
            new MessagesPlaceholder("chat_history"),
            ["human", "{input}"],
        ]);

        // Create the chain
        this.chain = prompt.pipe(this.model);
    }

    async chat(input: string): Promise<string> {
        try {
            // Add the user's message to history
            await this.messageHistory.addMessage(new HumanMessage(input));

            // Get the response using the chain
            const response = await this.chain.invoke({
                chat_history: await this.messageHistory.getMessages(),
                input,
            });

            // Add the AI's response to history
            await this.messageHistory.addMessage(response);

            return response.content;
        } catch (error) {
            console.error("Error in chat:", error);
            throw error;
        }
    }

    async clearHistory(): Promise<void> {
        this.messageHistory = new ChatMessageHistory();
    }
} 