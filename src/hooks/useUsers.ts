// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { User, PaginatedResponse, UserFilters } from '@/types';
import toast from 'react-hot-toast';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const useGetStudents = (filters?: UserFilters, options?: UseQueryOptions<PaginatedResponse<User>>) => {
    return useQuery({
      queryKey: ['users', 'students', filters],
      queryFn: () => usersApi.getStudents(filters),
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    });
  };

  const useGetAdmins = (filters?: UserFilters) => {
    return useQuery({
      queryKey: ['users', 'admins', filters],
      queryFn: () => usersApi.getAdmins(filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useGetAllUsers = (filters?: UserFilters) => {
    return useQuery({
      queryKey: ['users', 'all', filters],
      queryFn: () => usersApi.getAllUsers(filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useGetUser = (id: number) => {
    return useQuery({
      queryKey: ['users', id],
      queryFn: () => usersApi.getUser(id),
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const useGetUserStats = () => {
    return useQuery({
      queryKey: ['users', 'stats'],
      queryFn: () => usersApi.getUserStats(),
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };

  const changeUserRoleMutation = useMutation({
    mutationFn: ({ id, userType }: { id: number; userType: 'student' | 'admin' }) =>
      usersApi.changeUserRole(id, userType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });

  const createUserMutation = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const partialUpdateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      usersApi.partialUpdateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  return {
    // Queries
    useGetStudents,
    useGetAdmins,
    useGetAllUsers,
    useGetUser,
    useGetUserStats,
    // Mutations
    changeUserRole: changeUserRoleMutation.mutateAsync,
    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    partialUpdateUser: partialUpdateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    // Loading states
    isChangingRole: changeUserRoleMutation.isPending,
    isCreatingUser: createUserMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
  };
};