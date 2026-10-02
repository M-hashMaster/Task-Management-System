import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { CreateTaskInput, UpdateTaskInput } from '../validations/task.validation';
import { AppError } from '../utils/appError';

export class TaskController {
  public createTask = async (
    req: Request<{ boardId: string; listId: string }, unknown, CreateTaskInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const task = await taskService.createTask(
        req.user.userId,
        req.params.boardId,
        req.params.listId,
        req.body
      );
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  };

  public getTasks = async (
    req: Request<{ boardId: string; listId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const tasks = await taskService.getTasks(
        req.user.userId,
        req.params.boardId,
        req.params.listId
      );
      res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: { tasks }
      });
    } catch (error) {
      next(error);
    }
  };

  public getTaskById = async (
    req: Request<{ boardId: string; listId: string; taskId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const task = await taskService.getTaskById(
        req.user.userId,
        req.params.boardId,
        req.params.listId,
        req.params.taskId
      );
      res.status(200).json({
        success: true,
        message: 'Task retrieved successfully',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  };

  public updateTask = async (
    req: Request<{ boardId: string; listId: string; taskId: string }, unknown, UpdateTaskInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const task = await taskService.updateTask(
        req.user.userId,
        req.params.boardId,
        req.params.listId,
        req.params.taskId,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteTask = async (
    req: Request<{ boardId: string; listId: string; taskId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const task = await taskService.deleteTask(
        req.user.userId,
        req.params.boardId,
        req.params.listId,
        req.params.taskId
      );
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  };
}

export const taskController = new TaskController();
