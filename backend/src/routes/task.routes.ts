import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { validateBody, validateParams } from '../middleware/validate.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  boardListTaskParamsSchema,
  boardListOnlyParamsSchema
} from '../validations/task.validation';

const router = Router({ mergeParams: true });

router.post(
  '/',
  validateParams(boardListOnlyParamsSchema),
  validateBody(createTaskSchema),
  taskController.createTask
);

router.get(
  '/',
  validateParams(boardListOnlyParamsSchema),
  taskController.getTasks
);

router.get(
  '/:taskId',
  validateParams(boardListTaskParamsSchema),
  taskController.getTaskById
);

router.patch(
  '/:taskId',
  validateParams(boardListTaskParamsSchema),
  validateBody(updateTaskSchema),
  taskController.updateTask
);

router.delete(
  '/:taskId',
  validateParams(boardListTaskParamsSchema),
  taskController.deleteTask
);

export default router;
