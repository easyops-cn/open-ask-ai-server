import type { HealthResponse, ErrorResponse } from '../lib/types';

export const config = {
  runtime: 'nodejs',
};

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
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
