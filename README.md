# Open Ask AI

AI-powered documentation search with streaming responses using Vercel Functions, AI SDK v6, and bash-tool.

## Features

- Streaming AI responses for real-time interaction
- Read-only bash access to markdown documentation
- Multi-step agent reasoning with bash commands
- Production-ready with Vercel Functions and Fluid compute
- GPT-4o via Vercel AI Gateway

## Prerequisites

- Node.js 20+
- Vercel account with AI Gateway API key
- Markdown documentation files

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```bash
   VERCEL_AI_GATEWAY_API_KEY=your_api_key_here
   DOCS_DIR=/Users/wangshenwei/github/open-ask-ai/docs
   AGENT_INSTRUCTIONS="You are a helpful documentation assistant."
   ```

3. Add documentation files to `docs/` directory

4. Run locally:
   ```bash
   npm run dev
   ```

## API Endpoints

### GET /api/health

Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "version": "1.0.0"
}
```

### POST /api/search/stream

Streaming search endpoint.

**Request**:
```json
{
  "query": "How do I configure authentication?",
  "instructions": "Optional custom instructions"
}
```

**Response**: Server-Sent Events stream with AI response

## Usage Examples

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Search Documentation

```bash
curl -X POST http://localhost:3000/api/search/stream \
  -H "Content-Type: application/json" \
  -d '{"query": "What topics are covered in the documentation?"}'
```

### Custom Instructions

```bash
curl -X POST http://localhost:3000/api/search/stream \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Find API endpoints",
    "instructions": "Focus on REST API documentation"
  }'
```

## Deployment

### Deploy to Vercel

```bash
vercel --prod
```

### Set Environment Variables

Set environment variables in Vercel Dashboard:
- `VERCEL_AI_GATEWAY_API_KEY` - Your AI Gateway API key
- `DOCS_DIR` - Absolute path to documentation directory (e.g., `/var/task/docs`)

## Architecture

```
Client Request → Vercel Function → AI SDK v6 (streamText)
                                         ↓
                                   ToolLoopAgent
                                         ↓
                                   bash-tool (OverlayFs)
                                         ↓
                              Markdown Docs (read-only)
                                         ↓
                             Streaming Response → Client
```

### Key Components

- **Vercel Functions**: Serverless HTTP endpoints in `api/` directory
- **AI SDK v6**: `streamText` for streaming AI responses
- **bash-tool**: Provides bash, readFile, writeFile tools
- **just-bash**: OverlayFs for read-only filesystem access
- **AI Gateway**: Single endpoint for GPT-4o access

## Project Structure

```
open-ask-ai/
├── api/
│   ├── health.ts                    # GET /api/health
│   └── search/
│       └── stream.ts                # POST /api/search/stream
├── lib/
│   ├── types.ts                     # TypeScript interfaces
│   ├── utils.ts                     # Error handling utilities
│   ├── bash-tool-setup.ts          # OverlayFs + createBashTool config
│   └── agent.ts                     # Agent configuration
├── docs/                            # Markdown documentation directory
│   └── *.md                         # Your markdown files
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vercel.json                      # Vercel deployment config
├── .gitignore                       # Git ignore
├── .env.local                       # Local environment variables
└── README.md                        # Documentation
```

## How It Works

1. **Client sends query**: POST request to `/api/search/stream`
2. **Bash tools created**: OverlayFs provides read-only access to docs directory
3. **Agent processes query**: AI model uses bash commands to search documentation
4. **Results streamed**: Real-time streaming response to client

### Agent Capabilities

The agent can execute bash commands to explore documentation:
- `find` - Locate markdown files
- `grep` - Search for keywords
- `cat` - Read file contents
- `head`/`tail` - Preview files
- Pipes and command combinations

## Environment Variables

### Required

- `VERCEL_AI_GATEWAY_API_KEY` - Get from Vercel AI Gateway dashboard
- `DOCS_DIR` - Absolute path to markdown documentation directory

### Optional

- `AGENT_INSTRUCTIONS` - Custom system instructions for the agent

## Development

### Type Checking

```bash
npm run build
```

### Local Development

```bash
npm run dev
```

Visit `http://localhost:3000/api/health` to verify the server is running.

## Performance

- **Fluid Compute**: Enabled for cost-efficient scaling
- **maxDuration: 60**: Functions can run up to 60 seconds
- **OverlayFs**: Memory-based writes prevent disk I/O overhead
- **Streaming**: Real-time responses improve perceived performance
- **Cost-efficient**: Reduces token usage by ~4x compared to embedding entire docs

## Security

- **Read-Only Access**: OverlayFs prevents writing to actual filesystem
- **Sandboxed**: bash-tool provides isolated bash environment
- **Input Validation**: Query parameter validated before processing
- **Environment Variables**: API keys stored securely in Vercel

## License

MIT
