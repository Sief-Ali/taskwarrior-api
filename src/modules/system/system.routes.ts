import { Router } from 'express';
import { systemController } from './system.controller.js';
import { rateLimiter } from '@middleware/rateLimiter.js';

const router = Router();


// Health check
router.get('/health', rateLimiter(30, 60000), (req, res, next) => systemController.getHealthCheck(req, res, next));

export const systemRouter: Router = router;