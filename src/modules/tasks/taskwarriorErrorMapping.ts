import {
  TaskwarriorError,
  type TaskwarriorErrorCode,
} from 'taskwarrior-adapter';

export interface TaskwarriorHttpError {
  statusCode: number;
  code: TaskwarriorErrorCode;
  message: string;
}

const statusByTaskwarriorCode: Record<TaskwarriorErrorCode, number> = {
  NOT_INSTALLED: 503,
  COMMAND_FAILED: 502,
  COMMAND_TIMEOUT: 504,
  OUTPUT_LIMIT: 502,
  INVALID_JSON: 502,
  INVALID_TASK_DATA: 502,
  INVALID_UUID: 400,
};

export function getTaskwarriorHttpError(
  error: unknown,
): TaskwarriorHttpError | null {
  if (!(error instanceof TaskwarriorError)) return null;

  return {
    statusCode: statusByTaskwarriorCode[error.code],
    code: error.code,
    message: error.message,
  };
}
