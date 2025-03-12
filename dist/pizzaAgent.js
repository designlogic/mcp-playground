import OpenAI from 'openai';
import { z } from "zod";
import { MCPClient } from "./types/mcp.js";
// Define schema for pizza order using Zod
const pizzaOrderSchema = z.object({
    size: z.enum(["small", "medium", "large"]).describe("Size of the pizza"),
    crust: z.enum(["thin", "thick", "stuffed", "gluten-free"]).describe("Type of crust"),
    sauce: z.enum(["tomato", "bbq", "garlic", "alfredo"]).describe("Type of sauce"),
    toppings: z.array(z.string()).describe("List of toppings for the pizza").optional(),
});
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
    async createOrder(userRequest) {
        const toolsDescription = JSON.stringify(this.availableTools, null, 2);
        const response = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful pizza ordering assistant that uses MCP tools. Your job is to:
                        1. Understand the customer's pizza order request
                        2. Structure it into a valid pizza order
                        3. Only use available options from the MCP tools
                        4. Ask for clarification if the order is ambiguous

                        Available MCP tools:
                        ${toolsDescription}

                        Respond ONLY with a JSON object matching this schema:
                        {
                            "size": "small" | "medium" | "large",
                            "crust": "thin" | "thick" | "stuffed" | "gluten-free",
                            "sauce": "tomato" | "bbq" | "garlic" | "alfredo"
                        }`
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
        const orderData = JSON.parse(content);
        return pizzaOrderSchema.parse(orderData);
    }
    async submitOrder(order) {
        try {
            // Start a new order
            const startResult = await this.mcpClient.invokeTool("start-order", {
                size: order.size,
                crust: order.crust,
                sauce: order.sauce
            });
            // Extract order ID from the response text
            const orderIdMatch = startResult.content[0].text.match(/Order #([a-z0-9]+)/i);
            if (!orderIdMatch?.[1]) {
                throw new Error("Could not extract order ID from response");
            }
            const orderId = orderIdMatch[1];
            // Add toppings if specified
            if (order.toppings) {
                for (const topping of order.toppings) {
                    await this.mcpClient.invokeTool("add-topping", {
                        orderId,
                        topping
                    });
                }
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
