import { spawn } from 'child_process';
import { createInterface } from 'readline';
export class MCPClient {
    constructor() { }
    async connect() {
        // Start the MCP server process
        this.serverProcess = spawn('node', ['dist/server/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        // Handle server output
        this.serverProcess.stdout?.on('data', (data) => {
            console.log('Server output:', data.toString());
        });
        this.serverProcess.stderr?.on('data', (data) => {
            console.error('Server error:', data.toString());
        });
        // Wait for server to start
        await new Promise((resolve) => {
            const handler = (data) => {
                if (data.toString().includes('Server started with tools:')) {
                    this.serverProcess?.stderr?.removeListener('data', handler);
                    resolve(undefined);
                }
            };
            this.serverProcess?.stderr?.on('data', handler);
        });
    }
    async disconnect() {
        if (this.serverProcess) {
            this.serverProcess.kill();
        }
    }
    async listTools() {
        // Now we'll actually get the tools from the server
        const response = await this.invokeTool('_list_tools', {});
        const tools = JSON.parse(response.content[0].text);
        return tools;
    }
    async invokeTool(toolName, params) {
        if (!this.serverProcess) {
            throw new Error("Not connected to server");
        }
        // Send command to server
        const command = JSON.stringify({ tool: toolName, params });
        this.serverProcess.stdin?.write(command + '\n');
        // Wait for response
        return new Promise((resolve) => {
            const handler = (data) => {
                try {
                    const response = JSON.parse(data.toString());
                    this.serverProcess?.stdout?.removeListener('data', handler);
                    resolve(response);
                }
                catch (error) {
                    // If it's not JSON, it's probably debug output
                    console.log('Debug output:', data.toString());
                }
            };
            this.serverProcess?.stdout?.on('data', handler);
        });
    }
}
export class MCPServer {
    constructor() {
        this.tools = new Map();
        this.readline = createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }
    registerTool(name, definition) {
        this.tools.set(name, definition);
    }
    async handleCommand(line) {
        try {
            const command = JSON.parse(line);
            const tool = this.tools.get(command.tool);
            if (!tool) {
                console.error(`Tool ${command.tool} not found`);
                return;
            }
            try {
                // Validate parameters using Zod schema
                const params = tool.parameters.parse(command.params);
                const result = await tool.handler(params);
                // Format response
                const response = {
                    content: [{
                            type: 'text',
                            text: typeof result === 'string' ? result : JSON.stringify(result)
                        }]
                };
                console.log(JSON.stringify(response));
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Error handling command:', errorMessage);
                const response = {
                    content: [{
                            type: 'text',
                            text: `Error: ${errorMessage}`
                        }]
                };
                console.log(JSON.stringify(response));
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Invalid command format';
            console.error('Invalid command format:', errorMessage);
        }
    }
    async start() {
        // Log available tools
        console.error('Server started with tools:', Array.from(this.tools.keys()));
        // Handle incoming commands
        this.readline.on('line', (line) => this.handleCommand(line));
        // Keep the process running
        await new Promise(() => { });
    }
    async stop() {
        this.readline.close();
    }
}
