import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createBashTool } from 'bash-tool';
import { ToolLoopAgent, convertToModelMessages, stepCountIs } from 'ai';
import { getInstructions } from '../lib/agent.js';
import type { SearchStreamRequest, ErrorResponse, ProjectWithFiles } from '../lib/types.js';

// Environment variables for LLM configuration
const LLM_MODEL = process.env.LLM_MODEL || 'openai/gpt-oss-120b';
const LLM_REASONING_EFFORT = process.env.LLM_REASONING_EFFORT || 'low';
const LLM_TEXT_VERBOSITY = process.env.LLM_TEXT_VERBOSITY || 'medium';
const MAX_STEPS = parseInt(process.env.MAX_STEPS || '16', 10);

let projectCache: Map<string, Promise<ProjectWithFiles | null>> = new Map();

function getProject(projectId: string): Promise<ProjectWithFiles | null> {
  const cached = projectCache.get(projectId);
  if (cached) {
    return cached;
  }

  const projectFilePath = path.join(process.cwd(), 'generated', `${projectId}.json`);

  const projectPromise = (async () => {
    if (!existsSync(projectFilePath)) {
      return null;
    }

    const projectContent = await readFile(projectFilePath, 'utf-8');
    const project = JSON.parse(projectContent) as ProjectWithFiles;
    return project;
  })();

  projectCache.set(projectId, projectPromise);
  return projectPromise;
}

const ALLOWED_ORIGIN = '*';

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        },
      });
    }

    // Get project ID from request
    const projectId = body.project;

    if (!projectId) {
      const errorResponse: ErrorResponse = {
        error: 'Invalid request',
        details: 'Project parameter is required',
        timestamp: new Date().toISOString(),
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        },
      });
    }

    const project = await getProject(projectId);

    if (!project) {
      const errorResponse: ErrorResponse = {
        error: 'Project not found',
        details: `Project file not found: ${projectId}. Run 'npm run scan-docs' to generate it.`,
        timestamp: new Date().toISOString(),
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        },
      });
    }

    const files = project.files;

    const messages = await convertToModelMessages(body.messages);

    // Create bash tools with files passed directly
    const { tools } = await createBashTool({
      files,
    });

    // Get instructions from project or environment or default
    const instructions = getInstructions(project.name || 'the project');

    const agent = new ToolLoopAgent({
      model: LLM_MODEL,
      providerOptions: {
        openai: {
          reasoningEffort: LLM_REASONING_EFFORT as 'low' | 'medium' | 'high',
          textVerbosity: LLM_TEXT_VERBOSITY as 'low' | 'medium' | 'high',
        },
      },
      tools: {
        bash: tools.bash,
        readFile: tools.readFile,
      },
      instructions,
      stopWhen: stepCountIs(MAX_STEPS),
    });

    // Stream the agent's response
    const result = await agent.stream({
      messages: messages,
    });

    // Return UI message stream response
    return result.toUIMessageStreamResponse({
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      },
      // generateMessageId: () => `m-${messages.length}`
    });

  } catch (error) {
    console.error('Search stream error:', error);

    const errorResponse: ErrorResponse = {
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      },
    });
  }
}
