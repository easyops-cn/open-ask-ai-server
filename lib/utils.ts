import type { ErrorResponse } from './types.js';

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  details?: string,
  status: number = 500
): Response {
  const errorResponse: ErrorResponse = {
    error,
    details,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}

/**
 * Validates environment variables
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = ['VERCEL_AI_GATEWAY_API_KEY', 'DOCS_DIR'];
  const missing = required.filter(key => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Logs errors with context
 */
export function logError(context: string, error: unknown) {
  console.error(`[${context}] Error:`, {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });
}
