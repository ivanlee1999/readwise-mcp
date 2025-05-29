#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { ReadwiseService, getApiToken, Highlight } from "./services/readwise";
import fs from "fs";
import process from "process";

// Silence console output to avoid interfering with stdio transport
console.log = () => {};
console.error = () => {};
console.warn = () => {};
console.info = () => {};

// Load environment variables
dotenv.config();

// Process command line arguments
const args = process.argv.slice(2);
let apiToken: string;

try {
  // Get API token from command line or environment
  apiToken = args.length > 0 ? args[0] : getApiToken();
} catch (error) {
  console.error("Please provide a Readwise API token as a command-line argument");
  console.error("Usage: node dist/index.js <API_TOKEN>");
  process.exit(1);
}

// Initialize Readwise service with the API token
const readwiseService = new ReadwiseService(apiToken);

// Create an MCP server
const server = new Server(
  {
    name: "readwise-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Define tool schemas
const createHighlightSchema = {
  type: "object",
  properties: {
    text: { type: "string", description: "The highlighted text" },
    title: { type: "string", description: "The title of the source" },
    author: { type: "string", description: "The author of the source" },
    source_url: { type: "string", description: "URL of the source" },
    note: { 
      type: "string", 
      description: "Note associated with the highlight. You can include inline tags by starting the note with a period followed by a tag name (e.g., '.important This is a note'). Multiple tags can be added by separating them with spaces (e.g., '.important .toread This is a note')."
    },
    location: { type: "number", description: "Location of the highlight in the source" },
    location_type: { type: "string", description: "Type of location (e.g., page)" },
    highlighted_at: { type: "string", description: "ISO timestamp when the highlight was created" },
    category: { type: "string", description: "Category of the highlight (e.g., books, articles, tweets, podcasts)" },
    highlight_url: { type: "string", description: "Unique URL of the specific highlight" },
    image_url: { type: "string", description: "URL of a cover image for the source" },
  },
  required: ["text"],
};

const createHighlightsSchema = {
  type: "object",
  properties: {
    highlights: {
      type: "array",
      items: createHighlightSchema,
      description: "Array of highlights to create",
    },
  },
  required: ["highlights"],
};

// Set up request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_highlight",
        description: "Create a single highlight in Readwise",
        inputSchema: createHighlightSchema,
      },
      {
        name: "create_highlights",
        description: "Create multiple highlights in Readwise",
        inputSchema: createHighlightsSchema,
      },
      {
        name: "get_highlights",
        description: "Get all highlights from Readwise",
        inputSchema: { type: "object", properties: {} },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "create_highlight") {
      // Cast to unknown first to avoid TypeScript error
      const params = request.params.arguments as unknown as Highlight;
      const result = await readwiseService.createHighlight(params);
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(result, null, 2)
        }],
        isError: false,
      };
    } 
    else if (request.params.name === "create_highlights") {
      // Cast to unknown first to avoid TypeScript error
      const params = request.params.arguments as unknown as { highlights: Highlight[] };
      const result = await readwiseService.createHighlights(params.highlights);
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(result, null, 2)
        }],
        isError: false,
      };
    } 
    else if (request.params.name === "get_highlights") {
      const result = await readwiseService.getHighlights();
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(result, null, 2)
        }],
        isError: false,
      };
    }
    
    throw new Error(`Unknown tool: ${request.params.name}`);
  } catch (error: any) {
    return {
      content: [{ 
        type: "text", 
        text: `Error: ${error.message}` 
      }],
      isError: true,
    };
  }
});

// Set up resource handlers (empty for now, could be extended later)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return { resources: [] };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  throw new Error(`Resource not found: ${request.params.uri}`);
});

// Handle uncaught exceptions to prevent them from being output to stderr
process.on('uncaughtException', (error) => {
  // Don't exit the process as that could disrupt the MCP protocol
});

process.on('unhandledRejection', (reason) => {
  // Don't exit the process as that could disrupt the MCP protocol
});

// Main function to run the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Start the server
runServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
