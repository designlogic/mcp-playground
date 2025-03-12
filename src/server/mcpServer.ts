import { MCPServer, MCPToolDefinition } from '../types/mcp.js';
import { createOrder, getOrderStatus, addToppings, removeToppings } from '../tools/pizzaTools.js';
import { z } from 'zod';

// Create and configure the MCP server
const server = new MCPServer();

// Create the _list_tools tool
const listTools: MCPToolDefinition<{}> = {
    description: "List all available tools",
    parameters: z.object({}),
    handler: async () => {
        const tools = Array.from(server.getTools().entries()).map(([name, tool]) => ({
            name,
            description: tool.description,
            parameters: tool.parameters,
        }));
        return tools;
    },
};

// Register system tools
server.registerTool('_list_tools', listTools);

// Register pizza ordering tools
server.registerTool('createOrder', createOrder);
server.registerTool('getOrderStatus', getOrderStatus);
server.registerTool('addToppings', addToppings);
server.registerTool('removeToppings', removeToppings);

// Start the server
console.log('Starting MCP server...');
server.start().catch((error: Error) => {
    console.error('Error starting MCP server:', error);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down MCP server...');
    await server.stop();
    process.exit(0);
}); 