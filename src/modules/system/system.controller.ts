
import type { Request, Response, NextFunction } from 'express';
import { SystemService } from './system.service.js';
import { TaskwarriorService } from '@infrastructure/taskwarrior/index.js';

const systemService = new SystemService(
  new TaskwarriorService(),
);

export class SystemController {
  async getHealthCheck(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const health = await systemService.getHealth();
      res.status(200).json(health);
    } catch (error) {
      next(error);
    }
  }
}

export const systemController = new SystemController();
