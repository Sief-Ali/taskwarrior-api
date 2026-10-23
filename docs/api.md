# TaskWarrior API Reference

The API uses the `/v1` prefix by default. Set `API_PREFIX` to use a different
prefix. The default server address is `http://localhost:5000`.

## `GET /v1/health`

Returns backend health information and the installed Taskwarrior version.

## `GET /v1/tasks`

Returns the tasks exported by Taskwarrior as a JSON array. Task objects contain
Taskwarrior attributes; common fields include:

| Field | Type | Description |
|---|---|---|
| `id` | number | Taskwarrior's current numeric task ID. |
| `uuid` | string | Stable task UUID. |
| `description` | string | Task description. |
| `status` | string | Task status, such as `pending` or `completed`. |
| `project` | string | Project path, when set. |
| `entry` | string | Task creation timestamp in Taskwarrior UTC format. |
| `modified` | string | Last modification timestamp in Taskwarrior UTC format. |
| `urgency` | number | Taskwarrior's calculated urgency. |

Taskwarrior may return additional fields, including custom attributes.

Example:

```bash
curl http://localhost:5000/v1/tasks
```

## `GET /v1/tasks/:uuid`

Returns the task matching the supplied canonical UUID. A valid UUID that does
not match a task returns HTTP `404`.

```bash
curl http://localhost:5000/v1/tasks/1ad3ddbd-acde-4f06-80ce-2672c88e72c2
```

## `POST /v1/tasks`

Creates a task in the configured Taskwarrior data. The request body must be a
JSON object with a non-empty `description` (maximum 4096 characters). Optional
fields are `project`, `priority` (`H`, `M`, or `L`), `due`, and `tags` (an array
of tag strings). Unsupported properties and unsafe field values are rejected
with HTTP `400`.

```bash
curl -X POST http://localhost:5000/v1/tasks \
  -H 'Content-Type: application/json' \
  -d '{"description":"Buy bread and milk","project":"Home","priority":"M","due":"tomorrow","tags":["errands"]}'
```

Success returns HTTP `204 No Content`. The adapter does not return the new task's
UUID or parse human-readable command output to infer it.

This endpoint performs a real write and the API does not provide authentication.
Restrict access through trusted network/deployment controls.

## Error responses

Errors use the following JSON shape:

```json
{
  "success": false,
  "code": "COMMAND_TIMEOUT",
  "message": "Taskwarrior did not respond before the command timed out."
}
```

`code` is included for mapped Taskwarrior adapter errors. The adapter's stable
message is returned; diagnostic details such as stderr and command arguments are
kept in server logs.

| Adapter error code | HTTP status | Meaning |
|---|---:|---|
| `INVALID_UUID` | `400` | The supplied UUID is not in canonical format. |
| `COMMAND_FAILED` | `502` | Taskwarrior could not complete the operation. |
| `OUTPUT_LIMIT` | `502` | Taskwarrior output exceeded the adapter limit. |
| `INVALID_JSON` | `502` | Taskwarrior output was not valid JSON. |
| `INVALID_TASK_DATA` | `502` | Taskwarrior returned invalid task data. |
| `INVALID_FILTER` | `400` | A Taskwarrior filter value is invalid. |
| `INVALID_INPUT` | `400` | A task operation input is invalid. |
| `NOT_INSTALLED` | `503` | Taskwarrior is not installed or is unavailable. |
| `COMMAND_TIMEOUT` | `504` | Taskwarrior did not respond before the command timed out. |

A task UUID that is valid but does not identify an exported task returns HTTP
`404` with:

```json
{
  "success": false,
  "message": "Task not found"
}
```

Requests to unknown routes return HTTP `404`.

## Interactive documentation

Swagger UI is available at `http://localhost:5000/v1/api-docs` with the default
API prefix, or at `http://localhost:5000/api-docs`.
