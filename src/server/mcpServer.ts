import { z } from 'zod';
import { MCPServer } from '../types/mcp.js';

// Define the schema for pizza orders
const PizzaOrderSchema = z.object({
    size: z.enum(['small', 'medium', 'large']),
    crust: z.enum(['thin', 'thick', 'stuffed', 'gluten-free']),
    sauce: z.enum(['tomato', 'bbq', 'alfredo']),
    toppings: z.array(z.string()).optional(),
});

// Add delivery address schema
const DeliverySchema = z.object({
    orderId: z.string(),
    address: z.object({
        street: z.string(),
        unit: z.string().optional(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string()
    }),
    instructions: z.string().optional()
});

type PizzaOrder = z.infer<typeof PizzaOrderSchema>;
type DeliveryRequest = z.infer<typeof DeliverySchema>;

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

export async function startMCPServer() {
    const server = new MCPServer();

    // Register the _list_tools command
    server.registerTool('_list_tools', {
        description: 'List all available tools',
        parameters: z.object({}),
        handler: async () => {
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
            return tools;
        }
    });

    // Register tools for pizza ordering
    server.registerTool('startNewPizzaOrder', {
        description: 'Start a new pizza order with basic details',
        parameters: PizzaOrderSchema,
        handler: async (params: PizzaOrder) => {
            const orderId = Math.random().toString(36).substring(7);
            const result = {
                orderId,
                message: `Started new pizza order #${orderId} with size: ${params.size}, crust: ${params.crust}, sauce: ${params.sauce}`,
            };
            logMCPInteraction('startNewPizzaOrder', params, result);
            return result;
        },
    });

    const AddToppingsSchema = z.object({
        orderId: z.string(),
        toppings: z.array(z.string()),
    });

    type AddToppingsParams = z.infer<typeof AddToppingsSchema>;

    server.registerTool('addToppings', {
        description: 'Add toppings to an existing pizza order',
        parameters: AddToppingsSchema,
        handler: async (params: AddToppingsParams) => {
            const result = {
                message: `Added toppings ${params.toppings.join(', ')} to order #${params.orderId}`,
            };
            logMCPInteraction('addToppings', params, result);
            return result;
        },
    });

    server.registerTool('deliverOrder', {
        description: 'Request delivery for an existing pizza order',
        parameters: DeliverySchema,
        handler: async (params: DeliveryRequest) => {
            const fullAddress = [
                params.address.street,
                params.address.unit,
                `${params.address.city}, ${params.address.state} ${params.address.zipCode}`
            ].filter(Boolean).join(', ');
            
            const result = {
                message: `Delivery scheduled for order #${params.orderId} to: ${fullAddress}${params.instructions ? `\nDelivery instructions: ${params.instructions}` : ''}`
            };
            logMCPInteraction('deliverOrder', params, result);
            return result;
        },
    });

    // Start the server
    await server.start();
    console.error('Pizza Ordering MCP Server running on stdio');
} 