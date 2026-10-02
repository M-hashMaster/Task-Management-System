import { z } from 'zod';
import { objectIdSchema } from './common.validation';

export const taskStatusEnum = z.enum(['To Do', 'In Progress', 'Done'], {
  errorMap: () => ({ message: 'Status must be one of: "To Do", "In Progress", "Done"' })
});

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(150, 'Title cannot exceed 150 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  status: taskStatusEnum.optional().default('To Do'),
  assignedTo: objectIdSchema.nullable().optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Due date must be a valid ISO 8601 date string' })
    .nullable()
    .optional()
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(150, 'Title cannot exceed 150 characters')
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional(),
    status: taskStatusEnum.optional(),
    assignedTo: objectIdSchema.nullable().optional(),
    dueDate: z
      .string()
      .datetime({ message: 'Due date must be a valid ISO 8601 date string' })
      .nullable()
      .optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  });

export const boardListTaskParamsSchema = z.object({
  boardId: objectIdSchema,
  listId: objectIdSchema,
  taskId: objectIdSchema
});

export const boardListOnlyParamsSchema = z.object({
  boardId: objectIdSchema,
  listId: objectIdSchema
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type BoardListTaskParamsInput = z.infer<typeof boardListTaskParamsSchema>;
