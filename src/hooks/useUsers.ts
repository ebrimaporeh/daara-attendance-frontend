import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import toast from 'react-hot-toast'

export const useUsers = () => {
  const queryClient = useQueryClient();

  const useGetStudents = () => {
    return useQuery({
      queryKey: ['users', 'students'],
      queryFn: () => usersApi.getStudents(),
    });
  };

  const useGetAdmins = () => {
    return useQuery({
      queryKey: ['users', 'admins'],
      queryFn: () => usersApi.getAdmins(),
    });
  };

  const useGetAllUsers = () => {
    return useQuery({
      queryKey: ['users', 'all'],
      queryFn: () => usersApi.getAllUsers(),
    });
  };

  const useGetUser = (id: number) => {
    return useQuery({
      queryKey: ['users', id],
      queryFn: () => usersApi.getUser(id),
      enabled: !!id,
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

  return {
    useGetStudents,
    useGetAdmins,
    useGetAllUsers,
    useGetUser,
    changeUserRole: changeUserRoleMutation.mutateAsync,
  };
};