import { z } from 'zod';

const projectSchema = z
  .string()
  .min(1)
  .max(256)
  .regex(/^[A-Za-z0-9 ._-]+$/);
const tagSchema = z.string().min(1).max(256).regex(/^[A-Za-z0-9._-]+$/);
const dueSchema = z.string().min(1).max(128).regex(/^[A-Za-z0-9._+-]+$/);

export const createTaskSchema = z
  .object({
    description: z.string().min(1).max(4096).refine((value) => !value.includes('\0')),
    project: projectSchema.optional(),
    priority: z.enum(['H', 'M', 'L']).optional(),
    due: dueSchema.optional(),
    tags: z.array(tagSchema).optional(),
  })
  .strict();

export type CreateTaskRequest = z.infer<typeof createTaskSchema>;
