import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
  name: "pizza-ordering",
  version: "1.0.0",
});

// Define available options
const CRUSTS = ["thin", "thick", "stuffed", "gluten-free"] as const;
const SAUCES = ["tomato", "bbq", "garlic", "alfredo"] as const;
const TOPPINGS = [
  "pepperoni",
  "mushrooms",
  "onions",
  "sausage",
  "bacon",
  "extra cheese",
  "bell peppers",
  "olives",
  "chicken",
  "pineapple",
] as const;

// Register start order tool
server.tool(
  "start-order",
  "Start a new pizza order",
  {
    size: z.enum(["small", "medium", "large"]).describe("Size of the pizza"),
    crust: z.enum(CRUSTS).describe("Type of crust"),
    sauce: z.enum(SAUCES).describe("Type of sauce"),
    toppings: z.array(z.enum(TOPPINGS)).min(0).max(5).describe("List of toppings (max 5)"),
  },
  async ({ size, crust, sauce, toppings }) => {
    // Calculate base price
    let basePrice = size === "small" ? 10 : size === "medium" ? 12 : 15;
    
    // Add premium crust price
    if (crust === "stuffed" || crust === "gluten-free") {
      basePrice += 2;
    }
    
    // Add toppings price ($1 each)
    const toppingsPrice = toppings.length * 1;
    const totalPrice = basePrice + toppingsPrice;

    // Format toppings list for display
    const toppingsText = toppings.length > 0 
      ? `with ${toppings.join(", ")}`
      : "with no extra toppings";

    return {
      content: [
        {
          type: "text",
          text: `🍕 Order Summary:\n` +
                `- Size: ${size}\n` +
                `- Crust: ${crust}\n` +
                `- Sauce: ${sauce}\n` +
                `- Toppings: ${toppingsText}\n\n` +
                `Total Price: $${totalPrice.toFixed(2)}\n\n` +
                `Your order has been started! (Note: This is a demo server, no actual pizza will be made)`
        },
      ],
    };
  },
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Pizza Ordering MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
}); 