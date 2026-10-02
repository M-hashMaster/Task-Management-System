import { z } from 'zod';
import { objectIdSchema } from './common.validation';

export const createBoardSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
});

export const updateBoardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title cannot exceed 100 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field (title or description) must be provided for update'
});

export const boardIdParamSchema = z.object({
  boardId: objectIdSchema
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type BoardIdParamInput = z.infer<typeof boardIdParamSchema>;
