import { streamText } from 'ai';
import { DEFAULT_INSTRUCTIONS } from '../../lib/agent';
import type { SearchStreamRequest, ErrorResponse } from '../../lib/types';
import fs, { read } from 'fs';
import path from 'path';
import { createBashTool } from 'bash-tool';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

export async function POST(request: Request): Promise<Response> {
  try {
    // Parse request body
    const body = await request.json() as SearchStreamRequest;

    // Validate query
    if (!body.query || typeof body.query !== 'string' || body.query.trim().length === 0) {
      const errorResponse: ErrorResponse = {
        error: 'Invalid request',
        details: 'Query parameter is required and must be a non-empty string',
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

    // Create bash tools with files passed directly
    const { tools } = await createBashTool({
      files,
    });

    // Get instructions
    const instructions = body.instructions ||
                        process.env.AGENT_INSTRUCTIONS ||
                        DEFAULT_INSTRUCTIONS;

    // Stream the agent's response
    const result = streamText({
      model: 'openai/gpt-4o',
      system: instructions,
      prompt: body.query,
      tools: {
        bash: tools.bash,
        readFile: tools.readFile,
      },
    });

    // Return streaming response
    return result.toTextStreamResponse();

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
