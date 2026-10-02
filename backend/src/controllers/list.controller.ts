import { Request, Response, NextFunction } from 'express';
import { listService } from '../services/list.service';
import { CreateListInput, UpdateListInput } from '../validations/list.validation';
import { AppError } from '../utils/appError';

export class ListController {
  public createList = async (
    req: Request<{ boardId: string }, unknown, CreateListInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const list = await listService.createList(
        req.user.userId,
        req.params.boardId,
        req.body
      );
      res.status(201).json({
        success: true,
        message: 'List created successfully',
        data: { list }
      });
    } catch (error) {
      next(error);
    }
  };

  public getLists = async (
    req: Request<{ boardId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const lists = await listService.getLists(req.user.userId, req.params.boardId);
      res.status(200).json({
        success: true,
        message: 'Lists retrieved successfully',
        data: { lists }
      });
    } catch (error) {
      next(error);
    }
  };

  public getListById = async (
    req: Request<{ boardId: string; listId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const list = await listService.getListById(
        req.user.userId,
        req.params.boardId,
        req.params.listId
      );
      res.status(200).json({
        success: true,
        message: 'List retrieved successfully',
        data: { list }
      });
    } catch (error) {
      next(error);
    }
  };

  public updateList = async (
    req: Request<{ boardId: string; listId: string }, unknown, UpdateListInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const list = await listService.updateList(
        req.user.userId,
        req.params.boardId,
        req.params.listId,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'List updated successfully',
        data: { list }
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteList = async (
    req: Request<{ boardId: string; listId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const list = await listService.deleteList(
        req.user.userId,
        req.params.boardId,
        req.params.listId
      );
      res.status(200).json({
        success: true,
        message: 'List deleted successfully',
        data: { list }
      });
    } catch (error) {
      next(error);
    }
  };
}

export const listController = new ListController();
