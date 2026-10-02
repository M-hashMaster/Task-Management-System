import { apiClient } from './client';
import { ApiResponse, Task, TaskStatus } from '../types';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  assignedTo?: string | null;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignedTo?: string | null;
  dueDate?: string | null;
}

export const tasksApi = {
  getTasks: async (boardId: string, listId: string): Promise<Task[]> => {
    const response = await apiClient.get<ApiResponse<{ tasks: Task[] }>>(
      `/boards/${boardId}/lists/${listId}/tasks`
    );
    return response.data.data?.tasks || [];
  },

  getTaskById: async (boardId: string, listId: string, taskId: string): Promise<Task> => {
    const response = await apiClient.get<ApiResponse<{ task: Task }>>(
      `/boards/${boardId}/lists/${listId}/tasks/${taskId}`
    );
    if (!response.data.data?.task) {
      throw new Error(response.data.message || 'Task not found');
    }
    return response.data.data.task;
  },

  createTask: async (
    boardId: string,
    listId: string,
    payload: CreateTaskPayload
  ): Promise<Task> => {
    const response = await apiClient.post<ApiResponse<{ task: Task }>>(
      `/boards/${boardId}/lists/${listId}/tasks`,
      payload
    );
    if (!response.data.data?.task) {
      throw new Error(response.data.message || 'Failed to create task');
    }
    return response.data.data.task;
  },

  updateTask: async (
    boardId: string,
    listId: string,
    taskId: string,
    payload: UpdateTaskPayload
  ): Promise<Task> => {
    const response = await apiClient.patch<ApiResponse<{ task: Task }>>(
      `/boards/${boardId}/lists/${listId}/tasks/${taskId}`,
      payload
    );
    if (!response.data.data?.task) {
      throw new Error(response.data.message || 'Failed to update task');
    }
    return response.data.data.task;
  },

  deleteTask: async (
    boardId: string,
    listId: string,
    taskId: string
  ): Promise<Task> => {
    const response = await apiClient.delete<ApiResponse<{ task: Task }>>(
      `/boards/${boardId}/lists/${listId}/tasks/${taskId}`
    );
    if (!response.data.data?.task) {
      throw new Error(response.data.message || 'Failed to delete task');
    }
    return response.data.data.task;
  }
};
