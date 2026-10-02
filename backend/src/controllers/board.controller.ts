import { Request, Response, NextFunction } from 'express';
import { boardService } from '../services/board.service';
import { CreateBoardInput, UpdateBoardInput } from '../validations/board.validation';
import { AppError } from '../utils/appError';

export class BoardController {
  public createBoard = async (
    req: Request<Record<string, unknown>, unknown, CreateBoardInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const board = await boardService.createBoard(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Board created successfully',
        data: { board }
      });
    } catch (error) {
      next(error);
    }
  };

  public getBoards = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const boards = await boardService.getBoards(req.user.userId);
      res.status(200).json({
        success: true,
        message: 'Boards retrieved successfully',
        data: { boards }
      });
    } catch (error) {
      next(error);
    }
  };

  public getBoardById = async (
    req: Request<{ boardId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const board = await boardService.getBoardById(req.user.userId, req.params.boardId);
      res.status(200).json({
        success: true,
        message: 'Board retrieved successfully',
        data: { board }
      });
    } catch (error) {
      next(error);
    }
  };

  public updateBoard = async (
    req: Request<{ boardId: string }, unknown, UpdateBoardInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const board = await boardService.updateBoard(
        req.user.userId,
        req.params.boardId,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Board updated successfully',
        data: { board }
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteBoard = async (
    req: Request<{ boardId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const board = await boardService.deleteBoard(req.user.userId, req.params.boardId);
      res.status(200).json({
        success: true,
        message: 'Board deleted successfully',
        data: { board }
      });
    } catch (error) {
      next(error);
    }
  };
}

export const boardController = new BoardController();
