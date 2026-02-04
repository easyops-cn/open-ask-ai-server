import type { HealthResponse, ErrorResponse } from '../lib/types.js';

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

export async function GET(request: Request): Promise<Response> {
  try {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      },
    });
  } catch (error) {
    const errorResponse: ErrorResponse = {
      error: 'Health check failed',
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
