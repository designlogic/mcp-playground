import { MCPServer } from '../types/mcp.js';
import { createOrder, getOrderStatus } from '../tools/pizzaTools.js';

// Create and configure the MCP server
const server = new MCPServer();

// Register pizza ordering tools
server.registerTool('createOrder', createOrder);
server.registerTool('getOrderStatus', getOrderStatus);

// Start the server
console.log('Starting MCP server...');
server.start().catch((error: Error) => {
    console.error('Error starting MCP server:', error);
    process.exit(1);
}); 