import { apiClient } from './client';
import { LoginResponse, User } from '@/types';

export const authApi = {
  login: (phone: string, password: string): Promise<LoginResponse> => {
    return apiClient.post('/login/', { phone, password });
  },

  register: (userData: any): Promise<LoginResponse> => {
  return apiClient.post('/register/', userData);
},

  logout: (refreshToken: string) => {
    return apiClient.post('/users/logout/', { refresh_token: refreshToken });
  },

  changePassword: (oldPassword: string, newPassword: string, confirmNewPassword: string) => {
    return apiClient.post('/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    });
  },

  getProfile: (): Promise<User> => {
    return apiClient.get('/users/profile/');
  },

  updateProfile: (data: Partial<User>): Promise<User> => {
    return apiClient.patch('/users/profile/', data);
  },
};