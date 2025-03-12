import { createInterface } from 'readline';
import { Socket } from 'net';
import { z } from 'zod';

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
    private socket: Socket;
    private responseBuffer: string = '';
    private responseResolve?: (value: MCPToolResponse) => void;

    constructor() {
        this.socket = new Socket();
    }

    async connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Server connection timeout'));
            }, 5000);

            this.socket.connect(3002, 'localhost', () => {
                clearTimeout(timeout);
                console.log('Connected to MCP server');
                resolve();
            });

            this.socket.on('data', (data) => {
                const output = data.toString();
                this.handleServerOutput(output);
            });

            this.socket.on('error', (error) => {
                console.error('Socket error:', error);
                reject(error);
            });
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
        this.socket.end();
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
        return new Promise<MCPToolResponse>((resolve, reject) => {
            this.responseResolve = resolve;
            this.responseBuffer = '';

            const command = JSON.stringify({ tool: toolName, params });
            this.socket.write(command + '\n');

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
    private server: any;

    constructor() {
        const net = require('net');
        this.server = net.createServer((socket: Socket) => {
            console.log('Client connected');
            
            const rl = createInterface({
                input: socket,
                output: socket,
            });

            rl.on('line', (line) => this.handleCommand(line, socket));
            
            socket.on('end', () => {
                console.log('Client disconnected');
                rl.close();
            });
        });
    }

    registerTool<T>(name: string, definition: MCPToolDefinition<T>) {
        this.tools.set(name, definition);
    }

    private async handleCommand(line: string, socket: Socket) {
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
                socket.write(JSON.stringify(response) + '\n');
                return;
            }

            try {
                const params = tool.parameters.parse(command.params);
                const result = await tool.handler(params);
                
                const response: MCPToolResponse = {
                    content: [{
                        type: 'text',
                        text: typeof result === 'string' ? result : JSON.stringify(result)
                    }]
                };
                
                socket.write(JSON.stringify(response) + '\n');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Error handling command:', errorMessage);
                const response: MCPToolResponse = {
                    content: [{
                        type: 'text',
                        text: `Error: ${errorMessage}`
                    }]
                };
                socket.write(JSON.stringify(response) + '\n');
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
            socket.write(JSON.stringify(response) + '\n');
        }
    }

    async start(port: number = 3002) {
        return new Promise<void>((resolve) => {
            this.server.listen(port, () => {
                console.log(`MCP Server listening on port ${port}`);
                console.error('Server started with tools:', Array.from(this.tools.keys()));
                resolve();
            });
        });
    }

    async stop() {
        return new Promise<void>((resolve) => {
            this.server.close(() => {
                console.log('MCP Server stopped');
                resolve();
            });
        });
    }
} 