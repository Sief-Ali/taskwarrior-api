import type { Request, Response, NextFunction } from 'express';

export class SystemController {
  async getHealthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        status: 'healthy',
        system: 'Task Warrior Backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    } catch (error) {
      next(error);
    }
    
  }
}

export const systemController = new SystemController();