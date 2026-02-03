# API Reference

This document describes the HTTP API endpoints provided by Open Ask AI.

## Endpoints

### GET /api/health

Health check endpoint to verify the service is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "version": "1.0.0"
}
```

### POST /api/search/stream

Streaming search endpoint for querying documentation.

**Request Body:**
```json
{
  "query": "Your search query here",
  "instructions": "Optional custom instructions for the agent"
}
```

**Response:**
Server-Sent Events (SSE) stream with the agent's response.

## Authentication

Currently, no authentication is required for API access. In production, you should add authentication using:
- API keys
- OAuth 2.0
- JWT tokens
- Vercel Edge Middleware

## Rate Limits

Rate limiting is recommended for production deployments. Use Vercel's edge middleware to implement rate limiting based on:
- IP address
- API key
- User session

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

Common status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `500` - Internal Server Error
