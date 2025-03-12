import { spawn, ChildProcess } from 'child_process';
import { z } from 'zod';
import { createInterface } from 'readline';

export interface MCPTool {
    name: string;
    description: string;
    parameters: Record<string, any>;
}

export interface MCPToolResponse {
    content: Array<{
        type: string;
        text: string;
    }>;
}

export interface MCPToolDefinition<T> {
    description: string;
    parameters: z.ZodType<T>;
    handler: (params: T) => Promise<any>;
}

export class MCPClient {
    private serverProcess?: ChildProcess;
    private responseBuffer: string = '';
    private responseResolve?: (value: MCPToolResponse) => void;

    constructor() {}

    async connect(): Promise<void> {
        // Start the MCP server process
        this.serverProcess = spawn('node', ['dist/server/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Handle server output
        this.serverProcess.stdout?.on('data', (data) => {
            const output = data.toString();
            console.log('Server output:', output);
            this.handleServerOutput(output);
        });

        this.serverProcess.stderr?.on('data', (data) => {
            console.error('Server error:', data.toString());
        });

        // Wait for server to start
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Server startup timeout'));
            }, 10000);

            const handler = (data: Buffer) => {
                const output = data.toString();
                if (output.includes('Server started with tools:')) {
                    clearTimeout(timeout);
                    this.serverProcess?.stderr?.removeListener('data', handler);
                    resolve();
                }
            };
            this.serverProcess?.stderr?.on('data', handler);
        });
    }

    private handleServerOutput(output: string) {
        this.responseBuffer += output;
        try {
            const response = JSON.parse(this.responseBuffer);
            if (this.responseResolve) {
                this.responseResolve(response);
                this.responseResolve = undefined;
            }
            this.responseBuffer = '';
        } catch (error) {
            // Not a complete JSON response yet, keep buffering
        }
    }

    async disconnect(): Promise<void> {
        if (this.serverProcess) {
            this.serverProcess.kill();
        }
    }

    async listTools(): Promise<MCPTool[]> {
        const response = await this.invokeTool('_list_tools', {});
        try {
            const tools = JSON.parse(response.content[0].text);
            return tools;
        } catch (error) {
            console.error('Error parsing tools list:', error);
            throw error;
        }
    }

    async invokeTool(toolName: string, params: Record<string, any>): Promise<MCPToolResponse> {
        if (!this.serverProcess) {
            throw new Error("Not connected to server");
        }

        return new Promise<MCPToolResponse>((resolve, reject) => {
            // Set up response handler
            this.responseResolve = resolve;

            // Clear response buffer
            this.responseBuffer = '';

            // Send command to server
            const command = JSON.stringify({ tool: toolName, params });
            this.serverProcess?.stdin?.write(command + '\n');

            // Set timeout
            setTimeout(() => {
                if (this.responseResolve) {
                    this.responseResolve = undefined;
                    reject(new Error(`Tool invocation timeout: ${toolName}`));
                }
            }, 10000);
        });
    }
}

export class MCPServer {
    private tools: Map<string, MCPToolDefinition<any>> = new Map();
    private readline: ReturnType<typeof createInterface>;

    constructor() {
        this.readline = createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    registerTool<T>(name: string, definition: MCPToolDefinition<T>) {
        this.tools.set(name, definition);
    }

    private async handleCommand(line: string) {
        try {
            const command = JSON.parse(line);
            const tool = this.tools.get(command.tool);
            
            if (!tool) {
                const response: MCPToolResponse = {
                    content: [{
                        type: 'text',
                        text: `Error: Tool ${command.tool} not found`
                    }]
                };
                console.log(JSON.stringify(response));
                return;
            }

            try {
                // Validate parameters using Zod schema
                const params = tool.parameters.parse(command.params);
                const result = await tool.handler(params);
                
                // Format response
                const response: MCPToolResponse = {
                    content: [{
                        type: 'text',
                        text: typeof result === 'string' ? result : JSON.stringify(result)
                    }]
                };
                
                console.log(JSON.stringify(response));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Error handling command:', errorMessage);
                const response: MCPToolResponse = {
                    content: [{
                        type: 'text',
                        text: `Error: ${errorMessage}`
                    }]
                };
                console.log(JSON.stringify(response));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Invalid command format';
            console.error('Invalid command format:', errorMessage);
            const response: MCPToolResponse = {
                content: [{
                    type: 'text',
                    text: `Error: ${errorMessage}`
                }]
            };
            console.log(JSON.stringify(response));
        }
    }

    async start() {
        // Log available tools
        console.error('Server started with tools:', Array.from(this.tools.keys()));
        
        // Handle incoming commands
        this.readline.on('line', (line) => this.handleCommand(line));
        
        // Keep the process running
        await new Promise(() => {});
    }

    async stop() {
        this.readline.close();
    }
} 