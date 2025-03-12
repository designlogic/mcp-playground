import { startMCPServer } from './mcpServer.js';

async function main() {
    try {
        await startMCPServer();
    } catch (error) {
        console.error('Failed to start MCP server:', error);
        process.exit(1);
    }
}

main(); 