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
  MONGODB_URI: z
    .string()
    .default(
      'mongodb+srv://463688431_db_user:gKC7ua3kLIUahoY0@cluster0.dtdtza4.mongodb.net/simplechat?retryWrites=true&w=majority'
    ),
  JWT_SECRET: z.string().default('simple-chat-production-secure-jwt-secret-key-2026-v1'),
  JWT_EXPIRES_IN: z.string().default('30d'),
  SIGNUP_ENABLED: z
    .string()
    .default('true')
    .transform((val) => val === 'true' || val === '1'),
  CORS_ORIGIN: z.string().default('http://localhost:5000'),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default('mailto:admin@simplechat.local'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.format());
  throw new Error('Environment configuration validation failed');
}

export const env = parsed.data;

