import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from '@config/env.js';
import { errorHandler } from 'src/middleware/errorHandler.js';

import { systemRouter } from '@router/system/system';

export function createApp(): Application {
  const app = express();

  // Basic security and parsing middlewares
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: [env.CORS_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }



  // API Routes
  app.use(env.API_PREFIX, systemRouter);

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

