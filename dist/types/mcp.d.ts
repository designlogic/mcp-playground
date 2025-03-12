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
export declare class MCPClient {
    private serverProcess?;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    listTools(): Promise<MCPTool[]>;
    invokeTool(toolName: string, params: Record<string, any>): Promise<MCPToolResponse>;
}
export declare class MCPServer {
    private tools;
    private readline;
    constructor();
    registerTool<T>(name: string, definition: MCPToolDefinition<T>): void;
    private handleCommand;
    start(): Promise<void>;
    stop(): Promise<void>;
}
