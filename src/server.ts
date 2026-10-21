import { createApp } from '@/app.js';
import { env } from '@config/env.js';

async function bootstrap() {
  try {
    console.log('[TaskWarrior Backend] Initializing server...');

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log(`[TaskWarrior Backend] Backend API running at http://localhost:${env.PORT}`);
      console.log(`[TaskWarrior Backend] Environment: ${env.NODE_ENV}`);
    });

    const gracefulShutdown = () => {
      console.log('[TaskWarrior Backend] Shutting down gracefully...');
      server.close(() => {
        console.log('[TaskWarrior Backend] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('[TaskWarrior Backend] Fatal startup error:', error);
    process.exit(1);
  }
}

bootstrap();

