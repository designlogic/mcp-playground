import { MCPServer } from '../types/mcp.js';
import { createOrder, getOrderStatus, addToppings, removeToppings } from '../tools/pizzaTools.js';

// Create and configure the MCP server
const server = new MCPServer();

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