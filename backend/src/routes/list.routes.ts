import { Router } from 'express';
import { listController } from '../controllers/list.controller';
import taskRoutes from './task.routes';
import { validateBody, validateParams } from '../middleware/validate.middleware';
import {
  createListSchema,
  updateListSchema,
  boardListParamsSchema,
  boardOnlyParamSchema
} from '../validations/list.validation';

const router = Router({ mergeParams: true });

// Sub-routes for tasks inside a list: /api/boards/:boardId/lists/:listId/tasks
router.use('/:listId/tasks', taskRoutes);

router.post(
  '/',
  validateParams(boardOnlyParamSchema),
  validateBody(createListSchema),
  listController.createList
);

router.get(
  '/',
  validateParams(boardOnlyParamSchema),
  listController.getLists
);

router.get(
  '/:listId',
  validateParams(boardListParamsSchema),
  listController.getListById
);

router.patch(
  '/:listId',
  validateParams(boardListParamsSchema),
  validateBody(updateListSchema),
  listController.updateList
);

router.delete(
  '/:listId',
  validateParams(boardListParamsSchema),
  listController.deleteList
);

export default router;
