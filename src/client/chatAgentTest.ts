import * as dotenv from "dotenv";
dotenv.config();

import { ChatAgent } from "./chatAgent.js";

async function testChatAgentMemory() {
    try {
        const agent = new ChatAgent();

        // First question
        console.log("\nAsking first question...");
        const response1 = await agent.chat("What is the capital of France?");
        console.log("Response 1:", response1);

        // Follow-up question that requires memory of the previous answer
        console.log("\nAsking follow-up question...");
        const response2 = await agent.chat("What is the population of that city?");
        console.log("Response 2:", response2);

        // Another follow-up to test deeper context
        console.log("\nAsking second follow-up...");
        const response3 = await agent.chat("Compare its population with London's population.");
        console.log("Response 3:", response3);

        // Test memory clearing
        console.log("\nClearing chat history...");
        await agent.clearHistory();

        // Verify memory was cleared with a related question
        console.log("\nTesting after memory clear...");
        const response4 = await agent.chat("Which city were we just talking about?");
        console.log("Response 4:", response4);

    } catch (error) {
        console.error("Error in test:", error);
    }
}

// Run the test
console.log("Starting ChatAgent memory test...");
testChatAgentMemory(); 