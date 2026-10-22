import type { Request, Response, NextFunction } from 'express';
import { TaskwarriorClient } from 'taskwarrior-adapter';

const taskwarrior = new TaskwarriorClient();

export class SystemController {
  async getHealthCheck(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const taskwarriorVersion = await taskwarrior.getVersion();

      res.status(200).json({
        status: 'healthy',
        system: 'Task Warrior Backend',
        taskwarrior: {
          version: taskwarriorVersion,
        },
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const systemController = new SystemController();