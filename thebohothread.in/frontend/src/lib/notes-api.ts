import apiClient from '@/lib/api-client';
import { Note, Question, PaginatedResponse, ApiResponse } from '@/types';

export interface NotesFilter {
  class?: string;
  subject?: string;
  chapter?: string;
  search?: string;
  isRevisionNote?: boolean;
  page?: number;
  limit?: number;
}

export const notesApi = {
  getAll: async (filters: NotesFilter = {}): Promise<ApiResponse<PaginatedResponse<Note>>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    const { data } = await apiClient.get(`/notes?${params}`);
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Note>> => {
    const { data } = await apiClient.get(`/notes/${id}`);
    return data;
  },

  create: async (formData: FormData): Promise<ApiResponse<Note>> => {
    const { data } = await apiClient.post('/notes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: string, formData: FormData): Promise<ApiResponse<Note>> => {
    const { data } = await apiClient.put(`/notes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/notes/${id}`);
    return data;
  },

  incrementView: async (id: string): Promise<void> => {
    await apiClient.post(`/notes/${id}/view`);
  },
};

export const questionsApi = {
  getAll: async (filters: Partial<NotesFilter> & { type?: string; isPYQ?: boolean } = {}): Promise<ApiResponse<PaginatedResponse<Question>>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    const { data } = await apiClient.get(`/questions?${params}`);
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Question>> => {
    const { data } = await apiClient.get(`/questions/${id}`);
    return data;
  },

  create: async (payload: Partial<Question>): Promise<ApiResponse<Question>> => {
    const { data } = await apiClient.post('/questions', payload);
    return data;
  },

  update: async (id: string, payload: Partial<Question>): Promise<ApiResponse<Question>> => {
    const { data } = await apiClient.put(`/questions/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/questions/${id}`);
    return data;
  },
};
