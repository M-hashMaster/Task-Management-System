import { apiClient } from './client';
import { ApiResponse, Board } from '../types';

export interface CreateBoardPayload {
  title: string;
  description?: string;
}

export interface UpdateBoardPayload {
  title?: string;
  description?: string;
}

export const boardsApi = {
  getBoards: async (): Promise<Board[]> => {
    const response = await apiClient.get<ApiResponse<{ boards: Board[] }>>('/boards');
    return response.data.data?.boards || [];
  },

  getBoardById: async (boardId: string): Promise<Board> => {
    const response = await apiClient.get<ApiResponse<{ board: Board }>>(`/boards/${boardId}`);
    if (!response.data.data?.board) {
      throw new Error(response.data.message || 'Board not found');
    }
    return response.data.data.board;
  },

  createBoard: async (payload: CreateBoardPayload): Promise<Board> => {
    const response = await apiClient.post<ApiResponse<{ board: Board }>>('/boards', payload);
    if (!response.data.data?.board) {
      throw new Error(response.data.message || 'Failed to create board');
    }
    return response.data.data.board;
  },

  updateBoard: async (boardId: string, payload: UpdateBoardPayload): Promise<Board> => {
    const response = await apiClient.patch<ApiResponse<{ board: Board }>>(`/boards/${boardId}`, payload);
    if (!response.data.data?.board) {
      throw new Error(response.data.message || 'Failed to update board');
    }
    return response.data.data.board;
  },

  deleteBoard: async (boardId: string): Promise<Board> => {
    const response = await apiClient.delete<ApiResponse<{ board: Board }>>(`/boards/${boardId}`);
    if (!response.data.data?.board) {
      throw new Error(response.data.message || 'Failed to delete board');
    }
    return response.data.data.board;
  }
};
