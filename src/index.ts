import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/server/schema.js";

// Create a new MCP server instance
const server = new Server({
  name: "example-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// Define a simple calculator tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: "calculate",
      description: "Perform basic arithmetic operations",
      inputSchema: {
        type: "object",
        properties: {
          operation: { 
            type: "string",
            enum: ["add", "subtract", "multiply", "divide"]
          },
          a: { type: "number" },
          b: { type: "number" }
        },
        required: ["operation", "a", "b"]
      }
    }]
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "calculate") {
    const { operation, a, b } = args as { 
      operation: "add" | "subtract" | "multiply" | "divide";
      a: number;
      b: number;
    };
    
    let result;
    switch (operation) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        if (b === 0) throw new Error("Division by zero");
        result = a / b;
        break;
      default:
        throw new Error("Invalid operation");
    }

    return {
      toolResult: result
    };
  }
  throw new Error("Tool not found");
});

// Connect using stdio transport
const transport = new StdioServerTransport();

// Start the server
async function main() {
  try {
    await server.connect(transport);
    console.log("MCP Server started successfully");
  } catch (error) {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  }
}

main(); 