# Developer Guide

This guide is for anyone setting up the TaskWarrior API locally or contributing
to its development. For endpoint paths and response examples, see the
[API reference](./api.md).

## What this project does

The API exposes read-only HTTP endpoints over a local Taskwarrior installation.
It does not keep a separate task database: Taskwarrior remains the source of
truth, and the [`taskwarrior-adapter`](https://github.com/Sief-Ali/taskwarrior-adapter)
package runs the Taskwarrior CLI and returns typed results.

Current API operations:

- `GET /v1/health`: checks the Taskwarrior CLI version and reports process
  health.
- `GET /v1/tasks`: returns the tasks included by Taskwarrior's export.
- `GET /v1/tasks/:uuid`: looks up one task by its canonical UUID.

Task creation, changes, completion, deletion, authentication, and arbitrary task
filters are not currently implemented.

## Prerequisites

- Node.js compatible with the dependencies (Node.js 20 or newer is suitable).
- pnpm `12.14.0`, as declared in `package.json`.
- Taskwarrior installed and available to the backend process as `task`.
- A Taskwarrior configuration and data directory accessible to the account
  running the API.

Check the local Taskwarrior installation:

```bash
task --version
task export
```

`task export` may display personal task data in your terminal. Review your
Taskwarrior configuration before sharing its output.

## First-time setup

Clone the API repository and install its dependencies:

```bash
git clone https://github.com/Sief-Ali/taskwarrior-api.git
cd taskwarrior-api
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Start the development server:

```bash
pnpm dev
```

Nodemon watches `src/` and starts `tsx src/server.ts`. By default, the API
listens on port `5000`. Check that the server is responding:

```bash
curl http://localhost:5000/v1/health
curl http://localhost:5000/v1/tasks
```

Open Swagger UI at <http://localhost:5000/v1/api-docs> to inspect and try the
documented endpoints. The non-prefixed Swagger path
<http://localhost:5000/api-docs> is also available.

## Configuration

The checked-in `.env.example` documents the development defaults:

| Variable | Default | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | Controls development behavior and error stack output. |
| `API_PREFIX` | `/v1` | Prefix for health and task routes. |
| `PORT` | `5000` | Port on which the HTTP server listens. |
| `CORS_ORIGIN` | `http://localhost:3000` | An allowed browser origin. |
| `TASKWARRIOR_COMMAND` | `task` | Declared command setting; see the note below. |

Environment values are validated with Zod at startup. Start commands from the
server repository directory so dotenv loads `server/.env` predictably. Swagger
UI is available at `/api-docs` and at `${API_PREFIX}/api-docs`; with the default
prefix, that is `/v1/api-docs`.

**Current limitation:** `TASKWARRIOR_COMMAND` is validated but is not currently
passed to `TaskwarriorClient`. The adapter uses its default executable name
(`task`). To use a different executable, the backend needs to forward this
setting when constructing the adapter.

The CORS middleware permits the configured origin and the development origins
`http://localhost:3000` and `http://127.0.0.1:3000`. CORS is a browser policy,
not authentication or access control.

## How a request flows

```text
HTTP request
  -> Express middleware (Helmet, CORS, body parsing, logging)
  -> route and rate limiter
  -> controller (HTTP input/output)
  -> service (application behavior and adapter-error mapping)
  -> TaskwarriorService (infrastructure boundary)
  -> taskwarrior-adapter
  -> Taskwarrior CLI and configured task data
```

- `src/app.ts` assembles middleware, routes, Swagger UI, 404 handling, and the
  final error handler.
- `src/server.ts` starts the HTTP listener and handles shutdown signals.
- Each feature in `src/modules/` separates routes, controllers, and services.
- `src/infrastructure/taskwarrior/` wraps the external adapter.
- `src/modules/tasks/taskwarriorErrorMapping.ts` converts adapter errors to
  HTTP status codes while preserving the adapter's stable code and message.
- `src/swaggerConfig.ts` builds the OpenAPI document from route annotations and
  serves Swagger UI.

The health check calls `task --version` through the adapter. It is therefore a
Taskwarrior availability check as well as an HTTP health endpoint.

## Making a change

1. Create a focused branch from `master`.
2. Find the owning module and keep HTTP concerns in the controller, application
   behavior in the service, and CLI interaction behind
   `TaskwarriorService`.
3. For a new HTTP endpoint, add its route and OpenAPI annotations in the owning
   `*.routes.ts` file, controller behavior in `*.controller.ts`, and service
   behavior in `*.service.ts`.
4. If the endpoint changes public API behavior, update
   [the API reference](./api.md) and relevant Swagger schema or annotations.
5. Add or update tests under `test/`.
6. Run the checks below and inspect `git diff` before committing.

Avoid passing arbitrary Taskwarrior command expressions from HTTP input.
Validate and constrain user input before it can reach the adapter.

## Error handling contract

The adapter throws `TaskwarriorError` with a stable `code` and `message`, plus
optional diagnostic fields. The backend maps codes as follows:

| Adapter code | HTTP status |
|---|---:|
| `INVALID_UUID` | `400` |
| `COMMAND_FAILED`, `OUTPUT_LIMIT`, `INVALID_JSON`, `INVALID_TASK_DATA` | `502` |
| `NOT_INSTALLED` | `503` |
| `COMMAND_TIMEOUT` | `504` |

Mapped error responses include `success: false`, the adapter `code`, and its
stable `message`. Diagnostic data (`detail`, `stderr`, command arguments, exit
status, and signal) is logged for server-side investigation and must not be
returned to API clients. A valid UUID with no matching task is a normal
not-found result (`404`), not an adapter failure.

When adding adapter error codes, update the exhaustive mapping in
`taskwarriorErrorMapping.ts`, its tests, and the API error documentation. Unknown
errors should continue to reach the centralized error handler; do not convert
them to successful return values.

## Tests and quality checks

Run the Jest suite:

```bash
pnpm test
```

The current suite covers the adapter-to-HTTP error mapping. Tests are CommonJS
Jest files in `test/`; `test/transformer.cjs` uses the installed esbuild package
to transform TypeScript source imports. This avoids relying on `ts-jest`, which
is not compatible with the repository's installed TypeScript 7 compiler.

Run a TypeScript check:

```bash
pnpm exec tsc --noEmit -p tsconfig.json
```

Run ESLint:

```bash
pnpm lint
```

The current ESLint configuration is TypeScript-based and ESLint 10 requires
`jiti` to load it. If lint reports that `jiti` is missing, the lint tooling
dependencies/configuration need to be fixed before this command can pass.

Build and start the production output:

```bash
pnpm build
pnpm start
```

The current `build` script also emits declaration files through tsup. The
repository's installed TypeScript 7 no longer exposes the compiler API expected
by the declaration bundler; if the build fails during declaration generation,
align the TypeScript and tsup toolchain before treating the release build as
validated. The backend type-check command above is a separate useful check.

## Debugging tips

- `NOT_INSTALLED`: confirm `task --version` works for the same OS user that
  starts the API, and that the executable is on that process's `PATH`.
- `COMMAND_FAILED`: inspect server logs and verify Taskwarrior configuration
  and data-directory permissions.
- `COMMAND_TIMEOUT`: verify Taskwarrior can respond locally and review the
  adapter's timeout configuration.
- `INVALID_UUID`: `GET /tasks/:uuid` requires a canonical UUID, not a numeric
  Taskwarrior ID.
- `404 Task not found`: the UUID may be valid but absent from Taskwarrior's
  exported tasks.
- Browser CORS errors: check the exact scheme, host, and port against the
  configured and built-in allowed origins.
- Swagger route issues: check `API_PREFIX`; the prefixed docs route follows it.

## Operational and security notes

- The API is read-only, but task descriptions and custom attributes can contain
  sensitive data.
- There is no authentication or authorization. Keep the service on a trusted
  network or add an appropriate access-control layer before wider exposure.
- The in-memory rate limiter is process-local and is not shared across multiple
  server instances.
- Do not commit `.env` files, private task exports, or real user task data.
- Prefer isolated Taskwarrior data for integration testing. Avoid test commands
  that could change or purge your everyday task database.
