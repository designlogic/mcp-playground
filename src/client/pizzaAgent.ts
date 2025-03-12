import OpenAI from 'openai';
import { z } from "zod";
import type { MCPTool } from "../types/mcp.js";
import { MCPClient } from "../types/mcp.js";

// Main PizzaAgent class that handles pizza ordering
export class PizzaAgent {
    private openai: OpenAI;
    private mcpClient: MCPClient;
    private availableTools: MCPTool[] = [];

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
        this.mcpClient = new MCPClient();
    }

    async initialize() {
        try {
            await this.mcpClient.connect();
            this.availableTools = await this.mcpClient.listTools();
            console.log("Available MCP tools:", this.availableTools);
            return true;
        } catch (error) {
            console.error("Failed to initialize MCP client:", error);
            throw error;
        }
    }

    async handleRequest(userRequest: string): Promise<string> {
        const toolsDescription = JSON.stringify(this.availableTools, null, 2);
        
        const response = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful pizza ordering assistant that uses MCP tools. Your job is to:
                        1. Understand the customer's pizza-related request
                        2. Check if the requested action can be performed with available tools
                        3. For pizza orders:
                           - ALWAYS respond with a startNewPizzaOrder request first
                           - Required parameters: size (small/medium/large)
                           - Default to thin crust and tomato sauce if not specified
                           - DO NOT include toppings in the initial order
                           - The order ID will be provided in the response
                        4. For delivery requests:
                           - Extract the order ID from the request
                           - Parse the address into the required format
                           - Respond with a deliverOrder request containing:
                             {
                               "orderId": "the-order-id",
                               "address": {
                                 "street": "street-address",
                                 "unit": "apartment-number" (optional),
                                 "city": "city-name",
                                 "state": "state-code",
                                 "zipCode": "zip-code"
                               },
                               "instructions": "delivery-instructions" (optional)
                             }
                        5. If an action cannot be performed, respond with a JSON object: { "error": "Specific reason why the action cannot be performed" }

                        Available MCP tools:
                        ${toolsDescription}

                        Example requests and responses:

                        1. Pizza order (even if toppings are mentioned, only return size/crust/sauce):
                        User: "I want a large pepperoni pizza with extra cheese"
                        Response: {
                            "size": "large",
                            "crust": "thin",
                            "sauce": "tomato"
                        }

                        2. Delivery request:
                        User: "Deliver order #abc123 to Street: 123 Main St, Unit: 4B, City: San Francisco, State: CA, Zip: 94105"
                        Response: {
                            "orderId": "abc123",
                            "address": {
                                "street": "123 Main St",
                                "unit": "4B",
                                "city": "San Francisco",
                                "state": "CA",
                                "zipCode": "94105"
                            }
                        }

                        Remember: 
                        - For pizza orders, ONLY return size/crust/sauce in the initial response
                        - Toppings will be handled separately by the system
                        - For delivery requests, make sure to extract and use the existing order ID
                        - Format addresses exactly as shown in the example
                        - If a requested action requires a tool that's not available, respond with an error message`
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

        // Handle the order based on the type of request
        if (result.size) {
            // This is a new order request
            const orderResult = await this.submitOrder(result);
            
            // Check if we need to add toppings
            if (userRequest.toLowerCase().includes('pepperoni') || userRequest.toLowerCase().includes('cheese')) {
                const orderIdMatch = orderResult.match(/order #([a-z0-9]+)/i);
                if (orderIdMatch) {
                    const orderId = orderIdMatch[1];
                    const toppings = [];
                    if (userRequest.toLowerCase().includes('pepperoni')) toppings.push('pepperoni');
                    if (userRequest.toLowerCase().includes('cheese')) toppings.push('extra cheese');
                    
                    await this.mcpClient.invokeTool("addToppings", {
                        orderId,
                        toppings
                    });
                }
            }
            
            return orderResult;
        } else if (result.orderId && result.address) {
            // This is a delivery request
            try {
                const deliveryResult = await this.mcpClient.invokeTool("deliverOrder", result);
                return deliveryResult.content[0].text;
            } catch (error) {
                console.error("Failed to submit delivery request:", error);
                throw error;
            }
        } else {
            return `Cannot process request: Invalid response format from AI`;
        }
    }

    private async submitOrder(order: any): Promise<string> {
        try {
            // Start a new order
            const startResult = await this.mcpClient.invokeTool("startNewPizzaOrder", {
                size: order.size,
                crust: order.crust || "thin", // Default to thin crust if not specified
                sauce: order.sauce || "tomato", // Default to tomato sauce if not specified
                toppings: order.toppings
            });

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

            return startResult.content[0].text;
        } catch (error) {
            console.error("Failed to submit order:", error);
            throw error;
        }
    }

    async disconnect() {
        await this.mcpClient.disconnect();
    }
} 