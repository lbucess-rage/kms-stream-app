# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm start          # Start development server on port 15700
npm run build      # Build production bundle to /build directory
npm test           # Run tests in watch mode
npm test -- --coverage  # Run tests with coverage report
npm test -- --watchAll=false  # Run tests once (CI mode)
```

### TypeScript & Linting
The project uses Create React App's built-in ESLint configuration. TypeScript compilation happens automatically during development and build.

## Project Architecture

### Core Application Flow
The application is a React 17.x SPA that provides a testing interface for the KMS API with two modes:
1. **Streaming Mode**: Uses Server-Sent Events (SSE) for real-time responses
2. **Regular Mode**: Traditional HTTP JSON request/response

### Key Services & Utilities

#### KmsApiService (`src/services/kmsApi.ts`)
- Handles both streaming and regular API calls to the KMS endpoint
- Manages AbortController for stream cancellation
- Converts Python dict format responses to JSON (important for SSE parsing)
- Default endpoint: `http://10.62.130.84:19001/chat/query`

#### StreamParser (`src/utils/streamParser.ts`)
- Processes SSE messages and maintains state for chat content and evidence data
- Distinguishes between `type: 'chat'` (main response) and `type: 'info'` (evidence)
- Accumulates incremental streaming updates

### Component Architecture

The app follows a simple component hierarchy:
- **App.tsx**: Main container managing global state (API URL, streaming state, responses)
- **KmsApiInput**: API endpoint configuration
- **QuestionInput**: User input with history dropdown
- **StreamResponse**: Markdown-rendered chat responses
- **EvidenceDisplay**: Collapsible HTML evidence viewer

### State Management
Uses React's built-in `useState` hooks for state management. No external state libraries.

### API Response Formats

**Streaming Mode (SSE)**:
- Messages arrive as `data: {'type': 'chat', 'content': '...'}`
- Python dict format requires special parsing (single quotes, True/False/None)

**Regular Mode**:
- JSON response: `{response: "text", conversation_id: "id", evidence: [...]}`

## Development Notes

### Port Configuration
The development server runs on port 15700 (configured in package.json start script).

### Markdown Support
Uses `react-markdown` with `remark-gfm` for GitHub Flavored Markdown rendering in responses.

### Python Dict Parsing
The KMS API returns Python dict format in SSE streams. The service layer handles conversion:
- Single quotes → double quotes
- True/False/None → true/false/null

### Testing Approach
Uses React Testing Library with Jest. Test files follow the pattern `*.test.tsx` alongside components.