import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

dotenv.config();
// Also attempt to load the backend-local file when the app is started from the monorepo root.
dotenv.config({ path: path.join(currentDirectory, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api'),
  PORT: z.coerce.number().default(5000),
  CORS_ORIGIN: z.string().default('http://localhost:5000'),
  TASKWARRIOR_COMMAND: z.string().default('task'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.format());
  throw new Error('Environment configuration validation failed');
}

export const env = parsed.data;
