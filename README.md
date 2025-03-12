# AI Joke Agent

A simple AI-powered joke-telling agent built with LangChain.js and OpenAI's GPT-3.5.

## Features

- Tells random, clean jokes
- Can generate specific types of jokes (e.g., dad jokes, puns)
- Structured output with setup, punchline, and category
- Clean and family-friendly content

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

3. Run the example:
```bash
npx ts-node src/example.ts
```

## Usage

```typescript
import { JokeAgent } from './jokeAgent';

// Create a new joke agent
const jokeAgent = new JokeAgent(process.env.OPENAI_API_KEY!);

// Get a random joke
const randomJoke = await jokeAgent.tellJoke();
console.log(randomJoke);

// Get a specific type of joke
const dadJoke = await jokeAgent.tellJoke("dad joke");
console.log(dadJoke);
```

## Response Format

The jokes are returned in the following format:

```typescript
{
    setup: string;     // The setup line of the joke
    punchline: string; // The punchline that makes the joke funny
    category: string;  // The category or type of joke
}
```

## Requirements

- Node.js 14+
- OpenAI API key
- TypeScript
