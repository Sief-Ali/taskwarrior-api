import type { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const requests = new Map<string, RateLimitRecord>();

export function rateLimiter(maxRequests: number = 60, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();
    const clientRecord = requests.get(ip);

    if (!clientRecord || now > clientRecord.resetTime) {
      requests.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    if (clientRecord.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please slow down and try again shortly.',
      });
      return;
    }

    clientRecord.count += 1;
    next();
  };
}

