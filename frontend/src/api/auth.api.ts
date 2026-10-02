import { apiClient } from './client';
import { ApiResponse, AuthData } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthData> => {
    const response = await apiClient.post<ApiResponse<AuthData>>('/auth/register', payload);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Registration failed');
    }
    return response.data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthData> => {
    const response = await apiClient.post<ApiResponse<AuthData>>('/auth/login', payload);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Login failed');
    }
    return response.data.data;
  }
};
