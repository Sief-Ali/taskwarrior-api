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

const tagChangesSchema = z
  .array(tagSchema)
  .min(1)
  .refine((tags) => new Set(tags).size === tags.length);

export const modifyTaskSchema = z
  .object({
    description: z
      .string()
      .min(1)
      .max(4096)
      .refine((value) => !value.includes('\0'))
      .optional(),
    project: projectSchema.optional(),
    priority: z.enum(['H', 'M', 'L']).optional(),
    due: dueSchema.optional(),
    addTags: tagChangesSchema.optional(),
    removeTags: tagChangesSchema.optional(),
  })
  .strict()
  .refine(
    (input) =>
      input.description !== undefined ||
      input.project !== undefined ||
      input.priority !== undefined ||
      input.due !== undefined ||
      input.addTags !== undefined ||
      input.removeTags !== undefined,
  )
  .refine(
    (input) =>
      !input.addTags ||
      !input.removeTags ||
      !input.addTags.some((tag) => input.removeTags?.includes(tag)),
  );

export type CreateTaskRequest = z.infer<typeof createTaskSchema>;
export type ModifyTaskRequest = z.infer<typeof modifyTaskSchema>;
