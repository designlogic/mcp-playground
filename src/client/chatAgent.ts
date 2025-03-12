import { ChatOpenAI } from "@langchain/openai";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { MCPClient } from '../types/mcp.js';

export class ChatAgent {
    private model: ChatOpenAI;
    private messageHistory: ChatMessageHistory;
    private chain: any;
    private mcpClient: MCPClient;

    constructor() {
        // Initialize the Chat model using your API key from the .env file
        this.model = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0, // Using 0 for more deterministic responses
        });

        this.messageHistory = new ChatMessageHistory();
        this.mcpClient = new MCPClient();

        // Create a chat prompt template with pizza ordering capabilities
        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `You are a helpful pizza ordering assistant. You can help users order pizzas and check their order status.
                Available commands:
                - Order a pizza: Use createOrder with parameters (size: 'small'|'medium'|'large', toppings: string[], crust: 'thin'|'thick'|'stuffed', quantity: number, address: string)
                - Check order status: Use getOrderStatus with orderId
                - Add toppings: Use addToppings
                - Remove toppings: Use removeToppings
                
                When a user wants to order a pizza, collect all necessary information and use the createOrder command.
                When they ask about order status, use the getOrderStatus command with their order ID.
                Be conversational and helpful!`,
            ],
            new MessagesPlaceholder("chat_history"),
            ["human", "{input}"],
        ]);

        // Create the chain
        this.chain = prompt.pipe(this.model);
    }

    async connect(): Promise<void> {
        try {
            await this.mcpClient.connect();
            const tools = await this.mcpClient.listTools();
            console.log('Connected to MCP server with tools:', tools);
        } catch (error) {
            console.error('Error connecting to MCP server:', error);
            throw error;
        }
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

            // Check if the response contains a command to execute
            const responseContent = response.content;
            if (responseContent.includes('createOrder') || responseContent.includes('getOrderStatus')) {
                try {
                    // Extract command and parameters from the response
                    // This is a simple example - you might want to make this more robust
                    const command = responseContent.includes('createOrder') ? 'createOrder' : 'getOrderStatus';
                    const paramsMatch = responseContent.match(/\{([^}]+)\}/);
                    if (paramsMatch) {
                        const params = JSON.parse(paramsMatch[0]);
                        const mcpResponse = await this.mcpClient.invokeTool(command, params);
                        // Add the MCP response to the chat history
                        await this.messageHistory.addMessage(new AIMessage(mcpResponse.content[0].text));
                        return mcpResponse.content[0].text;
                    }
                } catch (error) {
                    console.error('Error executing MCP command:', error);
                }
            }

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

    async disconnect(): Promise<void> {
        await this.mcpClient.disconnect();
    }
} 