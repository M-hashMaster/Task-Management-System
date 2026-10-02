import { Task, ITask } from '../models/task.model';
import { User } from '../models/user.model';
import { listService } from './list.service';
import { AppError } from '../utils/appError';
import { CreateTaskInput, UpdateTaskInput } from '../validations/task.validation';
import { Types } from 'mongoose';

export class TaskService {
  public async verifyTaskAccess(
    userId: string,
    boardId: string,
    listId: string,
    taskId: string
  ): Promise<{ task: ITask }> {
    // 1. Verify user owns board and list belongs to board
    await listService.verifyListAccess(userId, boardId, listId);

    // 2. Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // 3. Verify task belongs to the specified list
    if (task.list.toString() !== listId) {
      throw new AppError('Task does not belong to the specified list', 400);
    }

    return { task };
  }

  private async validateAssignedUser(assignedToId?: string | null): Promise<Types.ObjectId | null> {
    if (!assignedToId) {
      return null;
    }

    if (!Types.ObjectId.isValid(assignedToId)) {
      throw new AppError('Invalid assigned user ID format', 400);
    }

    const assignedUser = await User.findById(assignedToId);
    if (!assignedUser) {
      throw new AppError('Assigned user does not exist', 400);
    }

    return assignedUser._id;
  }

  public async createTask(
    userId: string,
    boardId: string,
    listId: string,
    data: CreateTaskInput
  ): Promise<ITask> {
    // Verify board and list ownership/relation
    await listService.verifyListAccess(userId, boardId, listId);

    let assignedUserId: Types.ObjectId | null = null;
    if (data.assignedTo) {
      assignedUserId = await this.validateAssignedUser(data.assignedTo);
    }

    const task = await Task.create({
      title: data.title,
      description: data.description || '',
      status: data.status || 'To Do',
      list: listId,
      assignedTo: assignedUserId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null
    });

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email');
    return populatedTask || task;
  }

  public async getTasks(
    userId: string,
    boardId: string,
    listId: string
  ): Promise<ITask[]> {
    await listService.verifyListAccess(userId, boardId, listId);

    const tasks = await Task.find({ list: listId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: 1 });

    return tasks;
  }

  public async getTaskById(
    userId: string,
    boardId: string,
    listId: string,
    taskId: string
  ): Promise<ITask> {
    await this.verifyTaskAccess(userId, boardId, listId, taskId);

    const task = await Task.findById(taskId).populate('assignedTo', 'name email');
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return task;
  }

  public async updateTask(
    userId: string,
    boardId: string,
    listId: string,
    taskId: string,
    data: UpdateTaskInput
  ): Promise<ITask> {
    await this.verifyTaskAccess(userId, boardId, listId, taskId);

    const updatePayload: Record<string, unknown> = {};

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.status !== undefined) updatePayload.status = data.status;

    if (data.assignedTo !== undefined) {
      if (data.assignedTo === null) {
        updatePayload.assignedTo = null;
      } else {
        updatePayload.assignedTo = await this.validateAssignedUser(data.assignedTo);
      }
    }

    if (data.dueDate !== undefined) {
      updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!updatedTask) {
      throw new AppError('Task not found', 404);
    }

    return updatedTask;
  }

  public async deleteTask(
    userId: string,
    boardId: string,
    listId: string,
    taskId: string
  ): Promise<ITask> {
    const { task } = await this.verifyTaskAccess(userId, boardId, listId, taskId);

    await Task.findByIdAndDelete(taskId);
    return task;
  }
}

export const taskService = new TaskService();
