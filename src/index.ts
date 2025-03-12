import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
  name: "calculator",
  version: "1.0.0",
});

// Register calculator tool
server.tool(
  "calculate",
  "Perform basic arithmetic operations",
  {
    operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("The arithmetic operation to perform"),
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  },
  async ({ operation, a, b }) => {
    let result: number;
    
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
        if (b === 0) {
          return {
            content: [
              {
                type: "text",
                text: "Error: Division by zero is not allowed",
              },
            ],
          };
        }
        result = a / b;
        break;
      default:
        return {
          content: [
            {
              type: "text",
              text: "Error: Invalid operation",
            },
          ],
        };
    }

    return {
      content: [
        {
          type: "text",
          text: `Result of ${operation}(${a}, ${b}) = ${result}`,
        },
      ],
    };
  },
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Calculator MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
}); 