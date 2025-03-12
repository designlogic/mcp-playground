// agent.ts
import * as dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

const messageHistory = new ChatMessageHistory();

// Initialize the Chat model using your API key from the .env file
const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
});

// Create a chat prompt template
const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "You are a helpful assistant. Answer all questions to the best of your ability.",
    ],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
]);

// Create the chain
const chain = prompt.pipe(model);

// A sample main function that demonstrates a single query.
async function main() {
    try {
        // Add a message to history
        await messageHistory.addMessage(
            new HumanMessage("What is 50 plus 75?")
        );

        // Get the response
        const response = await chain.invoke({
            chat_history: await messageHistory.getMessages(),
            input: "What is 50 plus 75?",
        });

        // Add the response to history
        await messageHistory.addMessage(response);

        console.log("Agent output:", response.content);

        // Ask a follow-up question
        await messageHistory.addMessage(
            new HumanMessage("And what if we double that number?")
        );

        const followUpResponse = await chain.invoke({
            chat_history: await messageHistory.getMessages(),
            input: "And what if we double that number?",
        });

        console.log("Follow-up output:", followUpResponse.content);

    } catch (error) {
        console.error("Error running the agent:", error);
    }
}

main();
