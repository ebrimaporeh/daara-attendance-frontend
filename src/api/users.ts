import { apiClient } from './client';
import { User } from '@/types';

export const usersApi = {
  // Get all students
  getStudents: (): Promise<User[]> => {
    return apiClient.get('/users/students/');
  },

  // Get all admins
  getAdmins: (): Promise<User[]> => {
    return apiClient.get('/users/admins/');
  },

  // Get all users (admin only)
  getAllUsers: (): Promise<User[]> => {
    return apiClient.get('/users/');
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