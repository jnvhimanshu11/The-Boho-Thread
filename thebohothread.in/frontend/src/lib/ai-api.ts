import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types';

export const aiApi = {
  solveDoubt: async (question: string, imageBase64?: string): Promise<ApiResponse<{ answer: string }>> => {
    const { data } = await apiClient.post('/ai/solve-doubt', { question, imageBase64 });
    return data;
  },

  summarizeNotes: async (text: string): Promise<ApiResponse<{ summary: string }>> => {
    const { data } = await apiClient.post('/ai/summarize', { text });
    return data;
  },

  homeworkHelper: async (subject: string, question: string): Promise<ApiResponse<{ answer: string; explanation: string }>> => {
    const { data } = await apiClient.post('/ai/homework', { subject, question });
    return data;
  },

  essayWriter: async (topic: string, wordCount: number, style: string): Promise<ApiResponse<{ essay: string }>> => {
    const { data } = await apiClient.post('/ai/essay', { topic, wordCount, style });
    return data;
  },

  generateQuiz: async (subject: string, class_: string, chapter: string, count: number): Promise<ApiResponse<{ questions: any[] }>> => {
    const { data } = await apiClient.post('/ai/generate-quiz', { subject, class: class_, chapter, count });
    return data;
  },
};
