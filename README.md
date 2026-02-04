# Open Ask AI Server

AI-powered multi-project documentation search with streaming responses using Vercel Functions, AI SDK v6 ToolLoopAgent, and bash-tool.

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

1. **Pre-generation**: Run `npm run scan-docs` to scan all projects in `projects/` directory
2. **Generated Files**: Creates JSON files in `generated/` with all markdown content
3. **Runtime**: API loads project JSON into memory and creates bash-tool with files
4. **Agent Execution**: ToolLoopAgent uses bash commands to search pre-loaded files
5. **Streaming**: Returns UIMessage stream compatible with AI SDK UI components

```
Client Request → Vercel Function → AI SDK v6 (streamText)
                                         ↓
                                   ToolLoopAgent
                                         ↓
                                   bash-tool (OverlayFs)
                                         ↓
                              Pre-loaded Files (in-memory)
                                         ↓
                             Streaming Response → Client
```

## Prerequisites

- Node.js 20+
- OpenAI API key
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
    "name": "My Project",
    "instructions": "You are a helpful assistant for My Project documentation."
  }
}
```

### 3. Add Documentation

Create a directory for each project in `projects/`:

```
projects/
├── my-project/
│   ├── getting-started.md
│   ├── api-reference.md
│   └── guides/
│       └── authentication.md
```

### 4. Generate Documentation Files

Scan all projects and generate JSON files:

```bash
npm run scan-docs
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
npm install -g vercel
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
      "id": "msg-1",
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
        "id": "msg-1",
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
        "id": "msg-1",
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
        "id": "msg-1",
        "role": "user",
        "parts": [
          {
            "type": "text",
            "text": "What is authentication?"
          }
        ]
      },
      {
        "id": "msg-2",
        "role": "assistant",
        "parts": [
          {
            "type": "text",
            "text": "Authentication is..."
          }
        ]
      },
      {
        "id": "msg-3",
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

### Pre-deployment

Before deploying, ensure you've generated the documentation files:

```bash
npm run scan-docs
git add generated/
git commit -m "Update generated documentation"
git push
```

The `generated/` directory is committed to the repository so Vercel can access pre-scanned files at runtime.

## Development

### Type Checking

```bash
npx tsc --noEmit
```

### Scan Documentation

After adding or updating markdown files in `projects/`:

```bash
npm run scan-docs
```

### Local Development

```bash
vercel dev
```

## Performance

- **Pre-generated Files**: All documentation loaded into memory at startup
- **Fluid Compute**: Enabled for cost-efficient scaling
- **maxDuration: 60**: Functions can run up to 60 seconds
- **OverlayFs**: Memory-based writes prevent disk I/O overhead
- **Streaming**: Real-time responses improve perceived performance
- **Low Reasoning Effort**: Fast model responses with `reasoningEffort: "low"`

## Security

- **Read-Only Access**: OverlayFs prevents writing to actual filesystem
- **Sandboxed**: bash-tool provides isolated bash environment
- **Input Validation**: Messages validated before processing
- **Environment Variables**: API keys stored securely in Vercel
- **No File System Access**: All files pre-loaded from JSON

## Environment Variables

### Optional

None. Project configurations are defined in `projects.json`.

## License

MIT
