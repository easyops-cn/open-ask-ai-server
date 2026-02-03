import fs from 'node:fs';
import path from 'node:path';
import { createBashTool } from 'bash-tool';
import { ToolLoopAgent, convertToModelMessages, stepCountIs } from 'ai';
import { DEFAULT_INSTRUCTIONS } from '../../lib/agent.js';
import type { SearchStreamRequest, ErrorResponse } from '../../lib/types.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

export async function POST(request: Request): Promise<Response> {
  try {
    // Parse request body
    const body = await request.json() as SearchStreamRequest;

    // Validate request: must have messages
    if (!body.messages) {
      const errorResponse: ErrorResponse = {
        error: 'Invalid request',
        details: 'Messages parameter is required',
        timestamp: new Date().toISOString(),
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get docs JSON file path from environment, default to docs.json in project root
    const docsJsonPath = process.env.DOCS_JSON_PATH || path.join(process.cwd(), 'docs.json');

    if (!fs.existsSync(docsJsonPath)) {
      throw new Error(`Docs JSON file not found: ${docsJsonPath}. Run 'npm run scan-docs' to generate it.`);
    }

    // Load files from JSON
    const filesContent = fs.readFileSync(docsJsonPath, 'utf-8');
    const files = JSON.parse(filesContent) as Record<string, string>;

    const messages = await convertToModelMessages(body.messages);

    // Create bash tools with files passed directly
    const { tools } = await createBashTool({
      files,
    });

    // Get instructions
    const instructions = process.env.AGENT_INSTRUCTIONS ||
                        DEFAULT_INSTRUCTIONS;

    const agent = new ToolLoopAgent({
      model: 'openai/gpt-4.1-nano',
      tools: {
        bash: tools.bash,
        readFile: tools.readFile,
      },
      instructions,
      stopWhen: stepCountIs(10),
    });

    // Stream the agent's response
    const result = await agent.stream({
      messages: messages,
    });

    // Return UI message stream response
    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error('Search stream error:', error);

    const errorResponse: ErrorResponse = {
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
