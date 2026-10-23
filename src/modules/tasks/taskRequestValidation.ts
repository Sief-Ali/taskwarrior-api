import { z } from 'zod';

const projectSchema = z
  .string()
  .min(1)
  .max(256)
  .regex(/^[\p{L}\p{N}_.-]+(?: [\p{L}\p{N}_.-]+)*$/u);
const tagSchema = z.string().min(1).max(256).regex(/^[\p{L}\p{N}_.-]+$/u);
const dueSchema = z.string().min(1).max(128).regex(/^[\p{L}\p{N}_.+-]+$/u);
const descriptionSchema = z
  .string()
  .min(1)
  .max(4096)
  .refine((value) => value.trim().length > 0 && !value.includes('\0'));

export const createTaskSchema = z
  .object({
    description: descriptionSchema,
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
    description: descriptionSchema.optional(),
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
