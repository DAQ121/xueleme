import { apiClient } from './client';

// You should create a proper User type, probably in your lib/types.ts
interface User {
  id: number;
  email: string;
  phone?: string;
  role: string;
  isSubscribed: boolean;
}

export const userApi = {
  getMe: () => apiClient.get<User | null>('/me'),
};
