# Open Ask AI Server

A deployable-ready, serverless documentation assistant AI agent, can be hosted on [Vercel]((https://vercel.com/docs/functions)), leveraging LLM through [Vercel AI Gateway](https://vercel.com/ai-gateway), and providing in-memory filesystem based agentic searching using [bash-tool](https://github.com/vercel-labs/bash-tool), **ALL FOR FREE** ([Vercel Hobby Plan](https://vercel.com/docs/plans/hobby) with generous quota usage).

[Open Ask AI Server](https://github.com/easyops-cn/open-ask-ai-server) on GitHub is a template repository ready for deploy as a serverless function on Vercel.

Once deployed, it provides an API endpoint `/api/stream` that accepts conversation messages and streams back AI-generated responses based on pre-scanned markdown documentation files.

Then integrate with [Open Ask AI Widget](./index.mdx) on your documentation site.

## Usage

1. Click "Use this template" to create your own repo, or fork this repository.
2. Edit `projects.json` to define your documentation projects.
3. Add your markdown documentation files in the `projects/` directory.
4. Optionally, add an `AGENTS.md` file in each project folder to provide additional agent instructions, such as what the project is about and what's the docs file structure.
5. Deploy to Vercel using the Vercel CLI.

```bash
npm i -g vercel
vercel login
vercel --prod
```

Your AI agent API will be live at `https://<your-vercel-project>.vercel.app/api/stream`.

It accepts a POST request with conversation messages and streams back AI-generated responses. See the "API Endpoints" section below for details.

## Features

- **Multi-project support**: Serve multiple documentation projects from a single deployment
- **Conversation-based API**: Full conversation history support with UIMessage format
- **Streaming AI responses**: Real-time interaction with ToolLoopAgent
- **Pre-generated documentation**: Fast in-memory file access from pre-scanned JSON
- **Read-only bash access**: Secure bash commands for searching markdown documentation
- **Production-ready**: Vercel Functions with Fluid compute for cost-efficient scaling

## Architecture

### Core Components

- **API Endpoint**: `/api/stream` - POST endpoint with streaming UIMessage responses
- **Agent**: AI SDK v6 ToolLoopAgent with bash and readFile tools
- **Documentation Scanner**: Pre-scans project docs into JSON files for fast access
- **Project System**: Multi-project configuration via `projects.json`
- **Model**: OpenAI GPT-OSS-120B with low reasoning effort for fast responses
- **Deployment**: Vercel Functions with Fluid compute (60s max duration)

### How It Works

1. **Pre-generation**: Run `npm run build` to scan all projects in `projects/` directory
2. **Generated Files**: Creates JSON files in `generated/` with all markdown content
3. **Runtime**: API loads project JSON into memory and creates bash-tool with files
4. **Agent Execution**: ToolLoopAgent uses bash commands to search pre-loaded files
5. **Streaming**: Returns UIMessage stream compatible with AI SDK UI components

```
Client Request → Vercel Function → AI SDK
                                      ↓
                                ToolLoopAgent
                                      ↓
                                  bash-tool
                                      ↓
                          Pre-loaded Files (in-memory)
                                      ↓
                          Streaming Response → Client
```

## Prerequisites

- Node.js 20+
- Markdown documentation files

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Projects

Edit `projects.json` to define your documentation projects:

```json
{
  "my-project": {
    "name": "My Project"
  }
}
```

### 3. Add Documentation

Create a directory for each project in `projects/`:

```
projects/
├── my-project/
│   ├── AGENTS.md             # (Optional) Agent instructions
│   ├── getting-started.md
│   ├── api-reference.md
│   └── guides/
│       └── authentication.md
```

### 4. Generate Documentation Files

Scan all projects and generate JSON files:

```bash
npm run build
```

This creates files in `generated/`:

```
generated/
└── my-project.json
```

### 5. Initialize Vercel Project

```bash
npm install -g vercel
vercel login
vercel
```

### 5. Run Locally

```bash
vercel dev
```

Visit `http://localhost:3000/api/health` to verify the server is running.

## API Endpoints

### GET /api/health

Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-04T12:00:00.000Z",
  "version": "1.0.0"
}
```

### POST /api/stream

Streaming conversation endpoint with multi-project support.

**Request**:
```json
{
  "messages": [
    {
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "How do I configure authentication?"
        }
      ]
    }
  ],
  "project": "my-project"
}
```

**Parameters**:
- `messages` (optional): Array of UIMessage objects for conversation history
- `project` (optional): Project ID to use (defaults to first project in projects.json)

**Response**: Server-Sent Events stream with UIMessage format

## Usage Examples

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Simple Query

```bash
curl -X POST http://localhost:3000/api/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "parts": [
          {
            "type": "text",
            "text": "What topics are covered in the documentation?"
          }
        ]
      }
    ],
    "project": "my-project"
  }'
```

### Query Specific Project

```bash
curl -X POST http://localhost:3000/api/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "parts": [
          {
            "type": "text",
            "text": "Find API endpoints"
          }
        ]
      }
    ],
    "project": "my-project"
  }'
```

### Conversation with History

```bash
curl -X POST http://localhost:3000/api/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "parts": [
          {
            "type": "text",
            "text": "What is authentication?"
          }
        ]
      },
      {
        "role": "assistant",
        "parts": [
          {
            "type": "text",
            "text": "Authentication is..."
          }
        ]
      },
      {
        "role": "user",
        "parts": [
          {
            "type": "text",
            "text": "How do I implement it?"
          }
        ]
      }
    ],
    "project": "my-project"
  }'
```

## Project Structure

```
open-ask-ai-server/
├── api/
│   ├── health.ts                    # GET /api/health
│   └── stream.ts                    # POST /api/stream
├── lib/
│   ├── types.ts                     # TypeScript interfaces
│   ├── utils.ts                     # Error handling utilities
│   ├── bash-tool-setup.ts          # OverlayFs + createBashTool config
│   └── agent.ts                     # Agent configuration
├── scripts/
│   └── scan-docs.ts                 # Documentation scanner
├── projects/
│   └── [project-id]/                # Project documentation directories
│       └── *.md                     # Markdown files
├── generated/
│   └── [project-id].json            # Generated project files
├── projects.json                    # Project configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vercel.json                      # Vercel deployment config
└── README.md                        # Documentation
```

## Agent Capabilities

The agent can execute bash commands to explore documentation:
- `find` - Locate markdown files
- `grep` - Search for keywords
- `cat` - Read file contents
- `head`/`tail` - Preview files
- Pipes and command combinations

All commands operate on pre-loaded in-memory files for fast access.

## Deployment

### Deploy to Vercel

```bash
vercel --prod
```

## Development

### Type Checking

```bash
npx tsc --noEmit
```

### Local Development

```bash
vercel dev
```

## Performance

- **Pre-generated Files**: All documentation loaded into memory at startup
- **Fluid Compute**: Enabled for cost-efficient scaling
- **maxDuration: 60**: Functions can run up to 60 seconds
- **just-bash**: A simulated bash environment with an in-memory virtual filesystem
- **Streaming**: Real-time responses improve perceived performance

## Security

- **Read-Only Access**: just-bash provides a read-only in-memory virtual filesystem
- **Input Validation**: Messages validated before processing
- **No LLM API Keys**: Vercel Functions call Vercel AI Gateway directly
- **No File System Access**: All files pre-loaded from JSON

## License

MIT
