import type { Request, Response, NextFunction } from 'express';
import { env } from '@config/env.js';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code: string | undefined;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError
      ? err.message
      : 'An unexpected internal server error occurred';

  if (statusCode >= 500) {
    console.error('[Unhandled Error]:', err);
  }

  res.status(statusCode).json({
    success: false,
    ...(err instanceof AppError && err.code ? { code: err.code } : {}),
    message,
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
