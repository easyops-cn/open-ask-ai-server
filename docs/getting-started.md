# Getting Started

Welcome to the Open Ask AI documentation. This guide will help you get started with the AI-powered documentation search system.

## Overview

Open Ask AI is a documentation search system that uses AI agents to intelligently search through markdown documentation using bash commands.

## Key Features

- **Intelligent Search**: AI agent understands natural language queries
- **Bash-Powered**: Uses grep, find, cat, and other Unix tools for precise search
- **Streaming Responses**: Real-time streaming for better user experience
- **Read-Only**: Safe, sandboxed access to documentation files

## Quick Start

1. Set up your environment variables
2. Add documentation to the `docs/` directory
3. Run `npm run dev` to start the local server
4. Query your documentation via the API

## Example Queries

- "What authentication methods are supported?"
- "Find all API endpoints related to users"
- "Show me the configuration options"
- "List all available commands"

## Architecture

The system uses:
- Vercel Functions for serverless deployment
- AI SDK v6 for agent reasoning
- bash-tool for filesystem operations
- Vercel AI Gateway for model access
