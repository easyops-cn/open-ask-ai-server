// Request/Response types for API endpoints

import type { UIMessage } from "ai";

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

export interface SearchStreamRequest {
  messages?: UIMessage[]; // For conversation history
}

export interface ErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
}

// Agent configuration types
export interface AgentConfig {
  model: string;
  instructions: string;
  maxSteps?: number;
  docsDirectory: string;
}

// Bash tool configuration
export interface BashToolConfig {
  files: Record<string, string>; // File paths to content mapping
}
