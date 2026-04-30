// src/api/users.ts
import { apiClient } from './client';
import { User, PaginatedResponse, UserFilters } from '@/types';

export const usersApi = {
  // Get all students with pagination
  getStudents: (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return apiClient.get(`/users/students/${queryString ? `?${queryString}` : ''}`);
  },

  // Get all admins with pagination
  getAdmins: (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return apiClient.get(`/users/admins/${queryString ? `?${queryString}` : ''}`);
  },

  // Get all users with pagination (admin only)
  getAllUsers: (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return apiClient.get(`/users/${queryString ? `?${queryString}` : ''}`);
  },

  // Get specific user by ID
  getUser: (id: number): Promise<User> => {
    return apiClient.get(`/users/${id}/`);
  },

  // Change user role (admin only)
  changeUserRole: (id: number, userType: 'student' | 'admin'): Promise<void> => {
    return apiClient.patch(`/users/${id}/change-role/`, { user_type: userType });
  },

  // Create new user (admin only)
  createUser: (userData: Partial<User> & { password: string }): Promise<User> => {
    return apiClient.post('/users/', userData);
  },

  // Update user (admin only)
  updateUser: (id: number, userData: Partial<User>): Promise<User> => {
    return apiClient.put(`/users/${id}/`, userData);
  },

  // Partial update user
  partialUpdateUser: (id: number, userData: Partial<User>): Promise<User> => {
    return apiClient.patch(`/users/${id}/`, userData);
  },

  // Delete user (admin only)
  deleteUser: (id: number): Promise<void> => {
    return apiClient.delete(`/users/${id}/`);
  },

  // Get user statistics
  getUserStats: (): Promise<{ total: number; students: number; admins: number }> => {
    return apiClient.get('/users/stats/');
  },
};