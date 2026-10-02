import { apiClient } from './client';
import { ApiResponse, List } from '../types';

export interface CreateListPayload {
  title: string;
}

export interface UpdateListPayload {
  title: string;
}

export const listsApi = {
  getLists: async (boardId: string): Promise<List[]> => {
    const response = await apiClient.get<ApiResponse<{ lists: List[] }>>(`/boards/${boardId}/lists`);
    return response.data.data?.lists || [];
  },

  getListById: async (boardId: string, listId: string): Promise<List> => {
    const response = await apiClient.get<ApiResponse<{ list: List }>>(`/boards/${boardId}/lists/${listId}`);
    if (!response.data.data?.list) {
      throw new Error(response.data.message || 'List not found');
    }
    return response.data.data.list;
  },

  createList: async (boardId: string, payload: CreateListPayload): Promise<List> => {
    const response = await apiClient.post<ApiResponse<{ list: List }>>(`/boards/${boardId}/lists`, payload);
    if (!response.data.data?.list) {
      throw new Error(response.data.message || 'Failed to create list');
    }
    return response.data.data.list;
  },

  updateList: async (boardId: string, listId: string, payload: UpdateListPayload): Promise<List> => {
    const response = await apiClient.patch<ApiResponse<{ list: List }>>(`/boards/${boardId}/lists/${listId}`, payload);
    if (!response.data.data?.list) {
      throw new Error(response.data.message || 'Failed to update list');
    }
    return response.data.data.list;
  },

  deleteList: async (boardId: string, listId: string): Promise<List> => {
    const response = await apiClient.delete<ApiResponse<{ list: List }>>(`/boards/${boardId}/lists/${listId}`);
    if (!response.data.data?.list) {
      throw new Error(response.data.message || 'Failed to delete list');
    }
    return response.data.data.list;
  }
};
