import { z } from 'zod';
import { MCPServer, MCPToolDefinition } from "../types/mcp.js";

// Create server instance
const server = new MCPServer();

// Helper function to format timestamps
function getTimestamp(): string {
    return new Date().toISOString();
}

// Helper function to log MCP interactions
function logMCPInteraction(tool: string, params: any, result: any): void {
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
const listToolsDefinition: MCPToolDefinition<{}> = {
    description: 'List all available tools',
    parameters: z.object({}),
    handler: async () => {
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
                    name: 'removeToppings',
                    description: 'Remove toppings from an existing pizza order',
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
            return tools;
        } catch (error) {
            console.error('Error in _list_tools:', error);
            throw error;
        }
    }
};

interface PizzaOrderParams {
    size: 'small' | 'medium' | 'large';
    crust: 'thin' | 'thick' | 'stuffed' | 'gluten-free';
    sauce: 'tomato' | 'bbq' | 'alfredo';
    toppings?: string[];
}

const startOrderDefinition: MCPToolDefinition<PizzaOrderParams> = {
    description: 'Start a new pizza order with basic details',
    parameters: z.object({
        size: z.enum(['small', 'medium', 'large']),
        crust: z.enum(['thin', 'thick', 'stuffed', 'gluten-free']),
        sauce: z.enum(['tomato', 'bbq', 'alfredo']),
        toppings: z.array(z.string()).optional()
    }),
    handler: async (params) => {
        try {
            const orderId = Math.random().toString(36).substring(7);
            const message = `Started new pizza order #${orderId} with size: ${params.size}, crust: ${params.crust}, sauce: ${params.sauce}`;
            logMCPInteraction('startNewPizzaOrder', params, { orderId, message });
            return { orderId, message };
        } catch (error) {
            console.error('Error in startNewPizzaOrder:', error);
            throw error;
        }
    }
};

interface ToppingsParams {
    orderId: string;
    toppings: string[];
}

const addToppingsDefinition: MCPToolDefinition<ToppingsParams> = {
    description: 'Add toppings to an existing pizza order',
    parameters: z.object({
        orderId: z.string(),
        toppings: z.array(z.string())
    }),
    handler: async (params) => {
        try {
            const message = `Added toppings ${params.toppings.join(', ')} to order #${params.orderId}`;
            logMCPInteraction('addToppings', params, { message });
            return { message };
        } catch (error) {
            console.error('Error in addToppings:', error);
            throw error;
        }
    }
};

const removeToppingsDefinition: MCPToolDefinition<ToppingsParams> = {
    description: 'Remove toppings from an existing pizza order',
    parameters: z.object({
        orderId: z.string(),
        toppings: z.array(z.string())
    }),
    handler: async (params) => {
        try {
            const message = `Removed toppings ${params.toppings.join(', ')} from order #${params.orderId}`;
            logMCPInteraction('removeToppings', params, { message });
            return { message };
        } catch (error) {
            console.error('Error in removeToppings:', error);
            throw error;
        }
    }
};

interface DeliveryParams {
    orderId: string;
    address: {
        street: string;
        unit?: string;
        city: string;
        state: string;
        zipCode: string;
    };
    instructions?: string;
}

const deliverOrderDefinition: MCPToolDefinition<DeliveryParams> = {
    description: 'Request delivery for an existing pizza order',
    parameters: z.object({
        orderId: z.string(),
        address: addressSchema,
        instructions: z.string().optional()
    }),
    handler: async (params) => {
        try {
            const fullAddress = [
                params.address.street,
                params.address.unit,
                `${params.address.city}, ${params.address.state} ${params.address.zipCode}`
            ].filter(Boolean).join(', ');
            
            const message = `Delivery scheduled for order #${params.orderId} to: ${fullAddress}${params.instructions ? `\nDelivery instructions: ${params.instructions}` : ''}`;
            logMCPInteraction('deliverOrder', params, { message });
            return { message };
        } catch (error) {
            console.error('Error in deliverOrder:', error);
            throw error;
        }
    }
};

// Register all tools
server.registerTool('_list_tools', listToolsDefinition);
server.registerTool('startNewPizzaOrder', startOrderDefinition);
server.registerTool('addToppings', addToppingsDefinition);
server.registerTool('removeToppings', removeToppingsDefinition);
server.registerTool('deliverOrder', deliverOrderDefinition);

// Start the server
export async function startMCPServer() {
    try {
        await server.start();
        console.error("Pizza MCP Server running on stdio");
    } catch (error) {
        console.error("Fatal error in startMCPServer():", error);
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