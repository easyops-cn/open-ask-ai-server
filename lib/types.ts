// Request/Response types for API endpoints

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

export interface SearchStreamRequest {
  query: string;
  instructions?: string; // Optional custom instructions
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
  docsDirectory: string;
  readOnly: boolean;
}
