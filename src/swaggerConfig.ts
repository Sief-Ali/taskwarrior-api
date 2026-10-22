import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '@config/env.js';

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskWarrior API',
      version: '1.0.0',
      description: 'API for reading tasks from Taskwarrior.',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: 'Local TaskWarrior API server',
      },
    ],
    tags: [
      {
        name: 'Tasks',
        description: 'Taskwarrior task endpoints',
      },
      {
        name: 'System',
        description: 'Backend health endpoints',
      },
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            description: { type: 'string', example: 'upload taskwarrior adapter' },
            entry: { type: 'string', example: '20261021T225143Z' },
            modified: { type: 'string', example: '20261021T225143Z' },
            project: { type: 'string', example: 'TaskWarriorAdapter' },
            status: { type: 'string', example: 'pending' },
            uuid: {
              type: 'string',
              format: 'uuid',
              example: '1ad3ddbd-acde-4f06-80ce-2672c88e72c2',
            },
            urgency: { type: 'number', example: 1 },
          },
        },
      },
    },
  },
  apis: [path.join(sourceDirectory, 'modules/**/*.routes.ts')],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  app.use(`${env.API_PREFIX}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}
