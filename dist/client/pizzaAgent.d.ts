export declare class PizzaAgent {
    private openai;
    private mcpClient;
    private availableTools;
    constructor(apiKey: string);
    initialize(): Promise<boolean>;
    handleRequest(userRequest: string): Promise<string>;
    private submitOrder;
    disconnect(): Promise<void>;
}
