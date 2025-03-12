import { z } from 'zod';
import { MCPServer } from '../types/mcp.js';

// Define the schema for pizza orders
const PizzaOrderSchema = z.object({
    size: z.enum(['small', 'medium', 'large']),
    crust: z.enum(['thin', 'thick', 'stuffed', 'gluten-free']),
    sauce: z.enum(['tomato', 'bbq', 'alfredo']),
    toppings: z.array(z.string()).optional(),
});

type PizzaOrder = z.infer<typeof PizzaOrderSchema>;

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
                }
            ];
            return tools;
        }
    });

    // Register tools for pizza ordering
    server.registerTool('startNewPizzaOrder', {
        description: 'Start a new pizza order with basic details',
        parameters: PizzaOrderSchema,
        handler: async (params: PizzaOrder) => {
            const orderId = Math.random().toString(36).substring(7);
            return {
                orderId,
                message: `Started new pizza order #${orderId} with size: ${params.size}, crust: ${params.crust}, sauce: ${params.sauce}`,
            };
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
            return {
                message: `Added toppings ${params.toppings.join(', ')} to order #${params.orderId}`,
            };
        },
    });

    // Start the server
    await server.start();
    console.error('Pizza Ordering MCP Server running on stdio');
} 