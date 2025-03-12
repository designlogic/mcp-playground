import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from 'zod';

// Create server instance with metadata
const server = new McpServer({
    name: "pizza",
    version: "1.0.0",
});

// Helper function to format timestamps
function getTimestamp(): string {
    return new Date().toISOString();
}

// Helper function to log MCP interactions
function logMCPInteraction(tool: string, params: any, result: any) {
    console.error('\n=== MCP Interaction Log ===');
    console.error(`Timestamp: ${getTimestamp()}`);
    console.error(`Tool: ${tool}`);
    console.error('Parameters:', JSON.stringify(params, null, 2));
    console.error('Result:', JSON.stringify(result, null, 2));
    console.error('========================\n');
}

// Define schemas
const addressSchema = z.object({
    street: z.string(),
    unit: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
});

// Register tools
server.tool(
    "_list_tools",
    "List all available tools",
    {},
    async () => {
        try {
            const tools = [
                {
                    name: 'startNewPizzaOrder',
                    description: 'Start a new pizza order with basic details',
                    parameters: {
                        size: { type: 'string', enum: ['small', 'medium', 'large'] },
                        crust: { type: 'string', enum: ['thin', 'thick', 'stuffed', 'gluten-free'] },
                        sauce: { type: 'string', enum: ['tomato', 'bbq', 'alfredo'] },
                        toppings: { type: 'array', items: { type: 'string' }, optional: true }
                    }
                },
                {
                    name: 'addToppings',
                    description: 'Add toppings to an existing pizza order',
                    parameters: {
                        orderId: { type: 'string' },
                        toppings: { type: 'array', items: { type: 'string' } }
                    }
                },
                {
                    name: 'deliverOrder',
                    description: 'Request delivery for an existing pizza order',
                    parameters: {
                        orderId: { type: 'string' },
                        address: {
                            type: 'object',
                            properties: {
                                street: { type: 'string' },
                                unit: { type: 'string', optional: true },
                                city: { type: 'string' },
                                state: { type: 'string' },
                                zipCode: { type: 'string' }
                            }
                        },
                        instructions: { type: 'string', optional: true }
                    }
                }
            ];
            logMCPInteraction('_list_tools', {}, tools);
            return {
                content: [{ type: "text", text: JSON.stringify(tools, null, 2) }]
            };
        } catch (error) {
            console.error('Error in _list_tools:', error);
            throw error;
        }
    }
);

server.tool(
    "startNewPizzaOrder",
    "Start a new pizza order with basic details",
    {
        size: z.enum(['small', 'medium', 'large']),
        crust: z.enum(['thin', 'thick', 'stuffed', 'gluten-free']),
        sauce: z.enum(['tomato', 'bbq', 'alfredo']),
        toppings: z.array(z.string()).optional()
    },
    async (params) => {
        try {
            const orderId = Math.random().toString(36).substring(7);
            const message = `Started new pizza order #${orderId} with size: ${params.size}, crust: ${params.crust}, sauce: ${params.sauce}`;
            logMCPInteraction('startNewPizzaOrder', params, { orderId, message });
            return {
                content: [{ type: "text", text: message }]
            };
        } catch (error) {
            console.error('Error in startNewPizzaOrder:', error);
            throw error;
        }
    }
);

server.tool(
    "addToppings",
    "Add toppings to an existing pizza order",
    {
        orderId: z.string(),
        toppings: z.array(z.string())
    },
    async (params) => {
        try {
            const message = `Added toppings ${params.toppings.join(', ')} to order #${params.orderId}`;
            logMCPInteraction('addToppings', params, { message });
            return {
                content: [{ type: "text", text: message }]
            };
        } catch (error) {
            console.error('Error in addToppings:', error);
            throw error;
        }
    }
);

server.tool(
    "deliverOrder",
    "Request delivery for an existing pizza order",
    {
        orderId: z.string(),
        address: addressSchema,
        instructions: z.string().optional()
    },
    async (params) => {
        try {
            const fullAddress = [
                params.address.street,
                params.address.unit,
                `${params.address.city}, ${params.address.state} ${params.address.zipCode}`
            ].filter(Boolean).join(', ');
            
            const message = `Delivery scheduled for order #${params.orderId} to: ${fullAddress}${params.instructions ? `\nDelivery instructions: ${params.instructions}` : ''}`;
            logMCPInteraction('deliverOrder', params, { message });
            return {
                content: [{ type: "text", text: message }]
            };
        } catch (error) {
            console.error('Error in deliverOrder:', error);
            throw error;
        }
    }
);

// Start the server
export async function main() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("Pizza MCP Server running on stdio");
    } catch (error) {
        console.error("Fatal error in main():", error);
        process.exit(1);
    }
}

// Add error handlers
process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    if (error.message?.includes('Tool undefined not found')) {
        console.error('Invalid tool requested');
        return;
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 