// Request/Response types for API endpoints

import type { UIMessage } from "ai";

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

export interface SearchStreamRequest {
  messages?: UIMessage[]; // For conversation history
  project?: string; // Project ID to use for instructions and files
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

// Project configuration types
export interface ProjectConfig {
  name: string;
  instructions?: string;
}

export interface ProjectWithFiles extends ProjectConfig {
  files: Record<string, string>;
}

export interface GeneratedProjects {
  [projectId: string]: ProjectWithFiles;
}
