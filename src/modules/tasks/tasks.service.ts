import {
  getTaskwarriorHttpError,
} from './taskwarriorErrorMapping.js';
import { AppError } from '@middleware/errorHandler.js';
import { TaskwarriorService } from '../../infrastructure/taskwarrior/taskwarrior.client.js';
import type { CreateTaskRequest } from './taskRequestValidation.js';

export function mapTaskwarriorError(error: unknown): never {
  const mappedError = getTaskwarriorHttpError(error);
  if (!mappedError) throw error;

  if (mappedError.statusCode >= 500 && error instanceof Error) {
    console.error('[Taskwarrior command error]', {
      code: mappedError.code,
      detail: 'detail' in error ? error.detail : undefined,
      args: 'args' in error ? error.args : undefined,
      exitCode: 'exitCode' in error ? error.exitCode : undefined,
      signal: 'signal' in error ? error.signal : undefined,
      stderr: 'stderr' in error ? error.stderr : undefined,
    });
  }

  throw new AppError(
    mappedError.message,
    mappedError.statusCode,
    true,
    mappedError.code,
    { cause: error },
  );
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

  async createTask(input: CreateTaskRequest): Promise<void> {
    try {
      await this.taskwarriorService.createTask(input);
    } catch (error) {
      return mapTaskwarriorError(error);
    }
  }
}
