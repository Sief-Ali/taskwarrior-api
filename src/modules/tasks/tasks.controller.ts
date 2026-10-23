
import type { Request, Response, NextFunction } from 'express';
import { TasksService } from './tasks.service.js';
import { AppError } from '@middleware/errorHandler.js';
import { createTaskSchema, modifyTaskSchema } from './taskRequestValidation.js';

const tasksService = new TasksService();

export class TasksController {
  async getTasksList(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const tasks = await tasksService.getTasksList();

      res.status(200).json(tasks);
      
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(
    req: Request<{ uuid: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const task = await tasksService.getTaskById(req.params.uuid);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  async createTask(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const parsedBody = createTaskSchema.safeParse(req.body);
      if (!parsedBody.success) {
        throw new AppError('Invalid task input.', 400, true, 'INVALID_INPUT');
      }

      await tasksService.createTask(parsedBody.data);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  async modifyTask(
    req: Request<{ uuid: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const parsedBody = modifyTaskSchema.safeParse(req.body);
      if (!parsedBody.success) {
        throw new AppError('Invalid task input.', 400, true, 'INVALID_INPUT');
      }

      await tasksService.modifyTask(req.params.uuid, parsedBody.data);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

export const tasksController = new TasksController();
