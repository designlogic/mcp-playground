import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// Create server instance
const server = new McpServer({
    name: "pizza-ordering",
    version: "1.0.0",
});
// Define available options
const CRUSTS = ["thin", "thick", "stuffed", "gluten-free"];
const SAUCES = ["tomato", "bbq", "garlic", "alfredo"];
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
];
// Define topping prices
const TOPPING_PRICES = {
    "pepperoni": 1.5,
    "mushrooms": 1.0,
    "onions": 1.0,
    "sausage": 1.5,
    "bacon": 2.0,
    "extra cheese": 1.5,
    "bell peppers": 1.0,
    "olives": 1.0,
    "chicken": 2.0,
    "pineapple": 1.0,
};
const orders = new Map();
function calculateTotalPrice(order) {
    let total = order.basePrice;
    // Add premium crust price
    if (order.crust === "stuffed" || order.crust === "gluten-free") {
        total += 2;
    }
    // Add toppings prices
    for (const topping of order.toppings) {
        total += TOPPING_PRICES[topping];
    }
    return total;
}
function formatOrderSummary(order) {
    const toppingsText = order.toppings.size > 0
        ? `with ${Array.from(order.toppings).join(", ")}`
        : "with no toppings";
    return `🍕 Order #${order.id} Summary:\n` +
        `- Size: ${order.size}\n` +
        `- Crust: ${order.crust}\n` +
        `- Sauce: ${order.sauce}\n` +
        `- Toppings: ${toppingsText}\n\n` +
        `Total Price: $${order.totalPrice.toFixed(2)}`;
}
// Register start order tool
server.tool("start-order", "Start a new pizza order", {
    size: z.enum(["small", "medium", "large"]).describe("Size of the pizza"),
    crust: z.enum(CRUSTS).describe("Type of crust"),
    sauce: z.enum(SAUCES).describe("Type of sauce"),
}, async ({ size, crust, sauce }) => {
    const orderId = Math.random().toString(36).substring(2, 8);
    const basePrice = size === "small" ? 10 : size === "medium" ? 12 : 15;
    const order = {
        id: orderId,
        size,
        crust,
        sauce,
        toppings: new Set(),
        basePrice,
        totalPrice: basePrice + (crust === "stuffed" || crust === "gluten-free" ? 2 : 0)
    };
    orders.set(orderId, order);
    return {
        content: [
            {
                type: "text",
                text: formatOrderSummary(order) + "\n\nOrder started! You can now add or remove toppings."
            },
        ],
    };
});
// Register add topping tool
server.tool("add-topping", "Add a topping to an existing pizza order", {
    orderId: z.string().describe("The ID of the order to modify"),
    topping: z.enum(TOPPINGS).describe("The topping to add"),
}, async ({ orderId, topping }) => {
    const order = orders.get(orderId);
    if (!order) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Error: Order #${orderId} not found`
                },
            ],
        };
    }
    if (order.toppings.size >= 5) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Error: Cannot add more than 5 toppings to a pizza`
                },
            ],
        };
    }
    if (order.toppings.has(topping)) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ ${topping} is already on the pizza`
                },
            ],
        };
    }
    order.toppings.add(topping);
    order.totalPrice = calculateTotalPrice(order);
    return {
        content: [
            {
                type: "text",
                text: `✅ Added ${topping} ($${TOPPING_PRICES[topping].toFixed(2)})\n\n` +
                    formatOrderSummary(order)
            },
        ],
    };
});
// Register remove topping tool
server.tool("remove-topping", "Remove a topping from an existing pizza order", {
    orderId: z.string().describe("The ID of the order to modify"),
    topping: z.enum(TOPPINGS).describe("The topping to remove"),
}, async ({ orderId, topping }) => {
    const order = orders.get(orderId);
    if (!order) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Error: Order #${orderId} not found`
                },
            ],
        };
    }
    if (!order.toppings.has(topping)) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ ${topping} is not on the pizza`
                },
            ],
        };
    }
    order.toppings.delete(topping);
    order.totalPrice = calculateTotalPrice(order);
    return {
        content: [
            {
                type: "text",
                text: `✅ Removed ${topping} (-$${TOPPING_PRICES[topping].toFixed(2)})\n\n` +
                    formatOrderSummary(order)
            },
        ],
    };
});
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
