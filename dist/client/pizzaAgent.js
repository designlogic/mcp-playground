import OpenAI from 'openai';
import { MCPClient } from "../types/mcp.js";
// Main PizzaAgent class that handles pizza ordering
export class PizzaAgent {
    constructor(apiKey) {
        this.availableTools = [];
        this.openai = new OpenAI({ apiKey });
        this.mcpClient = new MCPClient();
    }
    async initialize() {
        try {
            await this.mcpClient.connect();
            this.availableTools = await this.mcpClient.listTools();
            console.log("Available MCP tools:", this.availableTools);
            return true;
        }
        catch (error) {
            console.error("Failed to initialize MCP client:", error);
            throw error;
        }
    }
    async handleRequest(userRequest) {
        const toolsDescription = JSON.stringify(this.availableTools, null, 2);
        const response = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful pizza ordering assistant that uses MCP tools. Your job is to:
                        1. Understand the customer's pizza-related request
                        2. Check if the requested action can be performed with available tools
                        3. If the action cannot be performed, respond with a JSON object: { "error": "Specific reason why the action cannot be performed" }
                        4. If the action can be performed, respond with a JSON object matching the appropriate tool's parameters

                        Available MCP tools:
                        ${toolsDescription}

                        Remember: If a requested action requires a tool that's not available, you MUST respond with an error message explaining why it can't be done.`
                },
                {
                    role: "user",
                    content: userRequest
                }
            ],
            temperature: 0.2,
            response_format: { type: "json_object" }
        });
        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response content from OpenAI");
        }
        const result = JSON.parse(content);
        // Check if the LLM indicated an error
        if (result.error) {
            return `Cannot process request: ${result.error}`;
        }
        // If no error, treat it as an order
        return this.submitOrder(result);
    }
    async submitOrder(order) {
        try {
            // Start a new order using the server's tool name
            const startResult = await this.mcpClient.invokeTool("startNewPizzaOrder", order);
            // Extract order ID from the response
            const result = JSON.parse(startResult.content[0].text);
            const orderId = result.orderId;
            // Add toppings if specified
            if (order.toppings?.length) {
                await this.mcpClient.invokeTool("addToppings", {
                    orderId,
                    toppings: order.toppings
                });
            }
            return `Order submitted successfully: ${JSON.stringify(startResult, null, 2)}`;
        }
        catch (error) {
            console.error("Failed to submit order:", error);
            throw error;
        }
    }
    async disconnect() {
        await this.mcpClient.disconnect();
    }
}
