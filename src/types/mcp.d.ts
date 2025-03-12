declare module 'mcp' {
    export interface MCPTool {
        name: string;
        description: string;
        parameters: Record<string, any>;
    }

    export class MCPClient {
        constructor();
        connect(): Promise<void>;
        disconnect(): Promise<void>;
        listTools(): Promise<MCPTool[]>;
        invokeTool(toolName: string, params: Record<string, any>): Promise<any>;
    }
} 