import { apiClient } from './client';
import { LoginResponse, User } from '@/types';

export const authApi = {
  login: async (phone: string, password: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/api/login/', { phone, password });
  },

  register: async (userData: any): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/api/register/', userData);
  },

  logout: async (refreshToken: string): Promise<void> => {
    return apiClient.post('/api/logout/', { refresh: refreshToken });
  },

  getProfile: async (): Promise<User> => {
    return apiClient.get<User>('/api/users/profile/');
  },

  changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string): Promise<{ access: string; refresh: string }> => {
    return apiClient.post('/api/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
  },

  updateProfile: async (data: any): Promise<User> => {
    return apiClient.patch<User>('/api/users/profile/', data);
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    return apiClient.post('/api/token/refresh/', { refresh: refreshToken });
  },
};