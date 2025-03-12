import { z } from 'zod';
import { MCPToolDefinition } from '../types/mcp.js';

// Define Zod schemas for pizza order parameters
const PizzaOrderParams = z.object({
    size: z.enum(['small', 'medium', 'large']),
    toppings: z.array(z.string()).min(1),
    crust: z.enum(['thin', 'thick', 'stuffed']),
    quantity: z.number().int().positive(),
    address: z.string().min(5),
});

const OrderStatusParams = z.object({
    orderId: z.string(),
});

// Mock database for orders
const orders = new Map<string, any>();

// Pizza ordering tools
export const createOrder: MCPToolDefinition<z.infer<typeof PizzaOrderParams>> = {
    description: "Create a new pizza order with specified size, toppings, crust type, quantity, and delivery address",
    parameters: PizzaOrderParams,
    handler: async (params) => {
        const orderId = Math.random().toString(36).substring(7);
        const order = {
            id: orderId,
            ...params,
            status: 'preparing',
            created: new Date().toISOString(),
        };
        orders.set(orderId, order);
        return {
            orderId,
            message: `Order created successfully! Your order ID is ${orderId}. Your ${params.quantity} ${params.size} pizza(s) with ${params.toppings.join(', ')} on ${params.crust} crust will be delivered to ${params.address}.`,
        };
    },
};

export const getOrderStatus: MCPToolDefinition<z.infer<typeof OrderStatusParams>> = {
    description: "Check the status of an existing pizza order using the order ID",
    parameters: OrderStatusParams,
    handler: async (params) => {
        const order = orders.get(params.orderId);
        if (!order) {
            throw new Error(`Order ${params.orderId} not found`);
        }
        return {
            orderId: params.orderId,
            status: order.status,
            details: `Your order for ${order.quantity} ${order.size} pizza(s) with ${order.toppings.join(', ')} is ${order.status}`,
        };
    },
}; 