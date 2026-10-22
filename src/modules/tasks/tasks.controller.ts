
import type { Request, Response, NextFunction } from 'express';
import { TasksService } from './tasks.service.js';

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
}

export const tasksController = new TasksController();
