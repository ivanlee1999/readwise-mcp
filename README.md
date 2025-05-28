# Readwise MCP Server

A Model Context Protocol (MCP) server for interacting with the Readwise API. This server allows LLMs to create and retrieve highlights in Readwise through a standardized interface.

## Features

- Create individual highlights in Readwise
- Create multiple highlights in a batch
- Retrieve all highlights from Readwise
- Support for inline tagging using Readwise's syntax

## Prerequisites

- Node.js (v14 or later)
- npm or npx
- Readwise API token (get it from your [Readwise account settings](https://readwise.io/access_token))

## Installation

### Option 1: Clone the repository

```bash
git clone https://github.com/yourusername/readwise-mcp.git
cd readwise-mcp
npm install
```

### Option 2: Use npx (without installation)

You can run the Readwise MCP server directly with npx without installing it locally. There are two ways to do this:

#### Using a published package

```bash
npx readwise-mcp@latest <YOUR_READWISE_API_TOKEN>
```

#### Using a local package (for development)

If you're developing the package locally and want to test it with npx:

```bash
# First, build the package
cd /path/to/readwise-mcp
npm run build
chmod +x dist/index.js  # Make the entry point executable

# Then run it with npx from any directory
npx /path/to/readwise-mcp <YOUR_READWISE_API_TOKEN>
```

## Configuration

The server requires a Readwise API token which can be provided in several ways:

1. As a command-line argument:
   ```bash
   npm start <YOUR_READWISE_API_TOKEN>
   # or with npx
   npx readwise-mcp@latest <YOUR_READWISE_API_TOKEN>
   ```

2. As an environment variable:
   ```bash
   export READWISE_API_TOKEN=<YOUR_READWISE_API_TOKEN>
   npm start
   ```

3. In a `.env` file in the project root:
   ```
   READWISE_API_TOKEN=<YOUR_READWISE_API_TOKEN>
   ```

## Running the Server

### Local Development

```bash
# Build the TypeScript code
npm run build

# Start the server
npm start
```



## MCP Tools

The server provides the following MCP tools:

### 1. `create_highlight`

Creates a single highlight in Readwise.

**Parameters:**
- `text` (required): The highlighted text
- `title`: The title of the source
- `author`: The author of the source
- `source_url`: URL of the source
- `source_type`: Type of the source (e.g., book, article)
- `note`: Note associated with the highlight. You can include inline tags by starting the note with a period followed by a tag name (e.g., '.important This is a note'). Multiple tags can be added by separating them with spaces (e.g., '.important .toread This is a note').
- `location`: Location of the highlight in the source
- `location_type`: Type of location (e.g., page)
- `highlighted_at`: ISO timestamp when the highlight was created
- `category`: Category of the highlight (e.g., books, articles, tweets, podcasts)
- `highlight_url`: Unique URL of the specific highlight
- `image_url`: URL of a cover image for the source

### 2. `create_highlights`

Creates multiple highlights in Readwise.

**Parameters:**
- `highlights`: Array of highlight objects (see `create_highlight` parameters)

### 3. `get_highlights`

Retrieves all highlights from Readwise.

## Inline Tagging

Readwise supports a feature called "inline tagging" which allows you to add tags to your highlights while you read. To use this feature, add a note to your highlight that begins with a period (.) followed by a tag name.

For example:
- `.important` - Tags the highlight with "important"
- `.important .toread` - Tags the highlight with both "important" and "toread"
- `.important This is a note` - Tags the highlight with "important" and adds "This is a note" as the note content

## Using with MCP Inspector

To test the server with the MCP Inspector:

1. Start the server
2. In the MCP Inspector, connect to the server using the stdio transport
3. Try out the available tools

## Development

### Building the project

```bash
npm run build
```

### Running tests

```bash
npm test
```

## License

MIT
