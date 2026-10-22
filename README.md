# TaskWarrior API

A lightweight REST API for exposing Taskwarrior tasks over HTTP. Built with **Node.js, TypeScript, Express, and [`taskwarrior-adapter`](https://www.npmjs.com/package/taskwarrior-adapter)**.

> **Status:** Early development  
> **Current scope:** Read-only task access

## Overview

TaskWarrior API provides an HTTP interface to a local Taskwarrior installation. It uses `taskwarrior-adapter` to communicate with the Taskwarrior CLI and returns task data as JSON.

The API is intended to make Taskwarrior data accessible to web applications, desktop clients, dashboards, and other services without requiring those clients to invoke the CLI themselves.

## Features

- Check the API and Taskwarrior CLI version.
- Retrieve the list of tasks.
- Retrieve an individual task by UUID.
- JSON responses over REST endpoints.
- OpenAPI documentation through Swagger UI.
- Environment-based configuration with Zod validation.
- Basic HTTP security middleware, CORS configuration, and request logging.
- TypeScript-based Express architecture.

## Architecture

```text
HTTP Client
    |
    v
Express REST API
    |
    +-- System Module
    |      |
    |      +-- Health Check
    |
    +-- Tasks Module
           |
           v
    TaskwarriorService
           |
           v
    taskwarrior-adapter
           |
           v
    Taskwarrior CLI
           |
           v
    Taskwarrior Data
```

The backend delegates Taskwarrior communication to `taskwarrior-adapter`. It does not implement a separate task database.

## Requirements

- Node.js compatible with the project's dependencies.
- pnpm `12.14.0`, as declared by the project.
- Taskwarrior installed and configured on the machine running the API.
- A working Taskwarrior command available to the backend process.

Verify the Taskwarrior installation before starting the server:

```bash
task --version
task export
```

The first command prints the installed version. The second checks whether Taskwarrior can export its tasks as JSON.

## Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/Sief-Ali/taskwarrior-api.git
cd taskwarrior-api
pnpm install
```

Create a local environment file using the supplied example:

```bash
cp .env.example .env
```

Review the configuration before starting the server.

## Configuration

The repository provides an `.env.example` with these variables:

| Variable | Example | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | Runtime environment |
| `API_PREFIX` | `/v1` | Prefix for API routes |
| `PORT` | `5000` | HTTP server port |
| `CORS_ORIGIN` | `http://localhost:3000` | Additional configured frontend origin |
| `TASKWARRIOR_COMMAND` | `task` | Intended Taskwarrior CLI command setting |

The environment schema currently defaults to `API_PREFIX=/api` when the variable is not set. If you use the supplied `.env.example` unchanged, the prefix is `/v1`.

**Current implementation note:** `TASKWARRIOR_COMMAND` is declared in the environment configuration, but it is not yet passed into the Taskwarrior client constructor. The adapter therefore uses its own default command unless the backend is updated to forward this option.

The application also permits requests from `http://localhost:3000` and `http://127.0.0.1:3000` in addition to the configured `CORS_ORIGIN`.

## Running the API

### Development

```bash
pnpm dev
```

Starts the development server through Nodemon and the project's TypeScript runner.

### Build

```bash
pnpm build
```

Builds the server entry point into `dist/` using tsup.

### Production

After a successful build:

```bash
pnpm start
```

The server listens on the configured port, defaulting to `5000`.

## API Reference

With the default configuration, the API prefix is `/api`. If `API_PREFIX=/v1` is set, replace `/api` with `/v1` in the task and health endpoints below.

### `GET /api/health`

Returns the backend's health information and the installed Taskwarrior version.

Example response:

```json
{
  "status": "healthy",
  "system": "Task Warrior Backend",
  "taskwarrior": {
    "version": "3.x.x"
  },
  "timestamp": "2026-10-22T00:00:00.000Z",
  "uptime": 42.5
}
```

The version, timestamp, and uptime values depend on the running system. The version shown above is illustrative.

The endpoint currently calls Taskwarrior to obtain its version. If that command fails, the health request can fail as well.

### `GET /api/tasks`

Returns the tasks exported by Taskwarrior as a JSON array.

Example response:

```json
[
  {
    "id": 1,
    "description": "Upload taskwarrior adapter",
    "entry": "20261021T225143Z",
    "modified": "20261021T225143Z",
    "project": "TaskWarriorAdapter",
    "status": "pending",
    "uuid": "1ad3ddbd-acde-4f06-80ce-2672c88e72c2",
    "urgency": 1
  }
]
```

The example illustrates a task response. Actual fields and values depend on your Taskwarrior data; additional task attributes may be present.

### `GET /api/tasks/:uuid`

Retrieves a single task using its UUID.

Example request:

```bash
curl http://localhost:5000/api/tasks/1ad3ddbd-acde-4f06-80ce-2672c88e72c2
```

A successful request returns the task object as JSON.

If the task does not exist, the API responds with HTTP `404`:

```json
{
  "success": false,
  "message": "Task not found"
}
```

### Unknown routes

Requests to unregistered routes return HTTP `404` with a JSON response:

```json
{
  "success": false,
  "message": "Route not found"
}
```

## Interactive API Documentation

Swagger UI is mounted at two paths:

- Default: `http://localhost:5000/api-docs`
- Under the configured API prefix: `http://localhost:5000/api/api-docs`

When `API_PREFIX=/v1`, the second URL becomes `http://localhost:5000/v1/api-docs`.

Use Swagger UI to inspect the documented endpoints and try requests against the running server.

## Project Structure

The main application code is organized by responsibility:

```text
src/
├── app.ts
├── server.ts
├── config/
│   └── env.ts
├── infrastructure/
│   └── taskwarrior/
│       ├── index.ts
│       └── taskwarrior.client.ts
├── modules/
│   ├── system/
│   │   ├── system.routes.ts
│   │   ├── system.controller.ts
│   │   └── system.service.ts
│   └── tasks/
│       ├── tasks.routes.ts
│       ├── tasks.controller.ts
│       └── tasks.service.ts
└── swaggerConfig.ts
```

- **`app.ts`** — Configures Express middleware, routes, Swagger, and error handling.
- **`server.ts`** — Starts the HTTP server and handles graceful shutdown signals.
- **`config/`** — Loads and validates environment variables.
- **`modules/`** — Contains route, controller, and service logic for API features.
- **`infrastructure/taskwarrior/`** — Wraps the external Taskwarrior adapter.
- **`swaggerConfig.ts`** — Configures OpenAPI metadata and Swagger UI.

## Current Scope and Limitations

The API currently supports reading Taskwarrior data:

- Check the Taskwarrior version.
- List tasks.
- Find a task by UUID.

Task creation, editing, completion, deletion, synchronization, and authentication are not currently implemented as API features.

The API's rate limiter is configured for the health and task routes. The current code does not provide user authentication or authorization, so the service should not be exposed to an untrusted network without additional security controls.

## Development Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the server |
| `pnpm start` | Run the built server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Apply ESLint fixes |
| `pnpm test` | Run the Jest test command |

## Security Notes

Task data may contain personal or sensitive information. Keep the API restricted to trusted clients and configure network access accordingly.

Before deploying:

- Use a suitable CORS origin rather than relying on development settings.
- Place the API behind appropriate network controls or authentication.
- Run the service with access only to the intended Taskwarrior data.
- Avoid exposing Taskwarrior data or the API to the public internet unintentionally.

## Related Project

[`taskwarrior-adapter`](https://github.com/Sief-Ali/taskwarrior-adapter) — The npm package used by this backend to communicate with the Taskwarrior CLI.

## Development Note

This project is developed by **Sief Ali**, with ChatGPT used as a development assistant for exploring ideas, implementation, troubleshooting, and documentation. The project direction and final technical decisions remain with the maintainer.
