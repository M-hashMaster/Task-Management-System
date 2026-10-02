import { Router } from 'express';
import { boardController } from '../controllers/board.controller';
import listRoutes from './list.routes';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody, validateParams } from '../middleware/validate.middleware';
import {
  createBoardSchema,
  updateBoardSchema,
  boardIdParamSchema
} from '../validations/board.validation';

const router = Router();

// All board and sub-resource routes require authentication
router.use(authenticate);

// Sub-routes for lists inside a board: /api/boards/:boardId/lists
router.use('/:boardId/lists', listRoutes);

router.post(
  '/',
  validateBody(createBoardSchema),
  boardController.createBoard
);

router.get(
  '/',
  boardController.getBoards
);

router.get(
  '/:boardId',
  validateParams(boardIdParamSchema),
  boardController.getBoardById
);

router.patch(
  '/:boardId',
  validateParams(boardIdParamSchema),
  validateBody(updateBoardSchema),
  boardController.updateBoard
);

router.delete(
  '/:boardId',
  validateParams(boardIdParamSchema),
  boardController.deleteBoard
);

export default router;
