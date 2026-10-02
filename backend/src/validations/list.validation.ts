import { z } from 'zod';
import { objectIdSchema } from './common.validation';

export const createListSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title cannot exceed 100 characters')
});

export const updateListSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title cannot exceed 100 characters')
    .optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Title must be provided for update'
});

export const boardListParamsSchema = z.object({
  boardId: objectIdSchema,
  listId: objectIdSchema
});

export const boardOnlyParamSchema = z.object({
  boardId: objectIdSchema
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type BoardListParamsInput = z.infer<typeof boardListParamsSchema>;
