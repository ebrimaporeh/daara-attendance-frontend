import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginResponse } from '@/types';
import { authApi } from '@/api/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAdmin: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const response: LoginResponse = await authApi.login(phone, password);
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      toast.success('Welcome back!');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const register = async (userData: any) => {
    try {
      const response: LoginResponse = await authApi.register(userData);
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      toast.success('Registration successful!');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      const response: any = await authApi.changePassword(oldPassword, newPassword, confirmPassword);
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser: User = await authApi.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const isAdmin = user?.user_type === 'admin';
  const isStudent = user?.user_type === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        changePassword,
        updateProfile,
        isAdmin,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};