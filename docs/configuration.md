# Configuration Guide

This guide explains how to configure Open Ask AI for your needs.

## Environment Variables

### Required Variables

**VERCEL_AI_GATEWAY_API_KEY**
- Purpose: Authenticate with Vercel AI Gateway
- How to get: Create an API key in Vercel AI Gateway settings
- Example: `vag_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**DOCS_DIR**
- Purpose: Absolute path to documentation directory
- Example: `/Users/wangshenwei/github/open-ask-ai/docs`
- Must contain .md files

### Optional Variables

**AGENT_INSTRUCTIONS**
- Purpose: Custom system instructions for the agent
- Default: Standard documentation assistant instructions
- Example: `"You are a technical documentation assistant for our API."`

## Vercel Configuration

The `vercel.json` file controls deployment settings:

```json
{
  "fluid": true,
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60,
      "runtime": "nodejs20.x"
    }
  }
}
```

### Configuration Options

- **fluid**: Enable Fluid compute for better performance
- **maxDuration**: Maximum execution time in seconds
- **runtime**: Node.js runtime version

## Model Configuration

The default model is GPT-4o via Vercel AI Gateway. To change the model, edit [api/search/stream.ts](../api/search/stream.ts):

```typescript
const result = streamText({
  model: 'openai/gpt-4o',  // Change this to use a different model
  // ... other options
});
```

Available models:
- `openai/gpt-4o` - GPT-4o (recommended)
- `anthropic/claude-sonnet-4` - Claude Sonnet 4
- `anthropic/claude-opus-4-5` - Claude Opus 4.5
- `google/gemini-2.0-flash-exp` - Gemini 2.0 Flash

## Documentation Structure

Organize your documentation files in the `docs/` directory:

```
docs/
├── getting-started.md
├── api-reference.md
├── configuration.md
├── guides/
│   ├── authentication.md
│   └── deployment.md
└── troubleshooting.md
```

## Agent Customization

Customize the agent's behavior by modifying [lib/agent.ts](../lib/agent.ts):

- Add domain-specific instructions
- Define preferred bash command patterns
- Specify output format requirements
- Add safety constraints
