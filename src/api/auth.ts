import { apiClient } from './client';

export const authApi = {
  login: async (phone: string, password: string) => {
    return apiClient.post('/login/', { phone, password });
  },

  register: async (userData: any) => {
    return apiClient.post('/register/', userData);
  },

  logout: async (refreshToken: string) => {
    return apiClient.post('/logout/', { refresh: refreshToken });
  },

  getProfile: async () => {
    return apiClient.get('/users/profile/');
  },

  changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    return apiClient.post('/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
  },

  updateProfile: async (data: any) => {
    return apiClient.patch('/users/profile/', data);
  },

  refreshToken: async (refreshToken: string) => {
    return apiClient.post('/token/refresh/', { refresh: refreshToken });
  },
};