import { streamText } from 'ai';
import { createBashTools } from '../../lib/bash-tool-setup';
import { DEFAULT_INSTRUCTIONS } from '../../lib/agent';
import type { SearchStreamRequest, ErrorResponse } from '../../lib/types';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

export async function POST(request: Request): Promise<Response> {
  try {
    // Parse request body
    const body: SearchStreamRequest = await request.json();

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

    // Get docs directory from environment
    const docsDir = process.env.DOCS_DIR;
    if (!docsDir) {
      throw new Error('DOCS_DIR environment variable is not set');
    }

    // Create bash tools with OverlayFs for read-only access
    const { tools } = await createBashTools({
      docsDirectory: docsDir,
      readOnly: true,
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
      tools: tools,
      maxSteps: 20, // Prevent infinite loops
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
