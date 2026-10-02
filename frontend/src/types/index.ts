export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  _id: string;
  title: string;
  board: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignedUser {
  _id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  list: string;
  assignedTo?: TaskAssignedUser | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}
