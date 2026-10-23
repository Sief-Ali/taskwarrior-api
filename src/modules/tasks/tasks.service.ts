import {
  TaskwarriorError,
  type TaskwarriorErrorCode,
} from 'taskwarrior-adapter';
import { AppError } from '@middleware/errorHandler.js';
import { TaskwarriorService } from '../../infrastructure/taskwarrior/taskwarrior.client.js';

interface TaskwarriorHttpError {
  statusCode: number;
}

const statusByTaskwarriorCode: Record<TaskwarriorErrorCode, TaskwarriorHttpError> = {
  NOT_INSTALLED: { statusCode: 503 },
  COMMAND_FAILED: { statusCode: 502 },
  COMMAND_TIMEOUT: { statusCode: 504 },
  OUTPUT_LIMIT: { statusCode: 502 },
  INVALID_JSON: { statusCode: 502 },
  INVALID_TASK_DATA: { statusCode: 502 },
  INVALID_UUID: { statusCode: 400 },
};

export function mapTaskwarriorError(error: unknown): never {
  if (!(error instanceof TaskwarriorError)) {
    throw error;
  }

  const { statusCode } = statusByTaskwarriorCode[error.code];
  throw new AppError(error.message, statusCode, true, error.code, { cause: error });
}

export class TasksService {
  private readonly taskwarriorService: TaskwarriorService;

  constructor() {
    this.taskwarriorService = new TaskwarriorService();
  }

  async getTasksList() {
    try {
      return await this.taskwarriorService.listTasks();
    } catch (error) {
      return mapTaskwarriorError(error);
    }
  }

  async getTaskById(uuid: string) {
    try {
      return await this.taskwarriorService.getTask(uuid);
    } catch (error) {
      return mapTaskwarriorError(error);
    }
  }
}
