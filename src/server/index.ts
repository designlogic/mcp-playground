import { startMCPServer } from './mcpServer.js';

startMCPServer().catch((error: Error) => {
    console.error('Error starting MCP server:', error);
    process.exit(1);
}); 