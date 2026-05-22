import apiClient from '@/lib/api-client';
import { User, ApiResponse } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'school_admin';
  class?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  me: async (): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post('/auth/reset-password', { token, password });
    return data;
  },
};
