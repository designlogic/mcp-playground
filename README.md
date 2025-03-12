# MCP Server Playground

A simple Model Context Protocol (MCP) server implementation that provides a calculator tool.

## Features

- Basic arithmetic operations (add, subtract, multiply, divide)
- MCP-compliant server implementation
- TypeScript/Node.js based

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/designlogic/mcp-playground.git
cd mcp-playground
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Running the Server

Start the server in development mode:
```bash
npm run dev
```

Or build and run in production mode:
```bash
npm run build
npm start
```

## Available Tools

### Calculator Tool

The server provides a calculator tool with the following operations:
- Addition
- Subtraction
- Multiplication
- Division

Example usage through MCP client:
```json
{
  "operation": "add",
  "a": 5,
  "b": 3
}
```

## Development

- `npm run dev` - Start the server in development mode with hot reload
- `npm run build` - Build the TypeScript code
- `npm start` - Run the built code

## License

ISC
