// src/hooks/useAttendance.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import { AttendanceRecord, AttendanceSummary, PaginatedResponse, AttendanceFilters } from '@/types';
import toast from 'react-hot-toast';

export const useAttendance = () => {
  const queryClient = useQueryClient();

  const useGetAttendance = (filters?: AttendanceFilters, options?: UseQueryOptions<PaginatedResponse<AttendanceRecord>>) => {
    return useQuery({
      queryKey: ['attendance', filters],
      queryFn: () => attendanceApi.getAttendance(filters),
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    });
  };

  const useGetTodayAttendance = (page?: number, pageSize?: number) => {
    return useQuery({
      queryKey: ['attendance', 'today', page, pageSize],
      queryFn: () => attendanceApi.getTodayAttendance(page, pageSize),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const useGetStudentAttendance = (studentId: number, page?: number, pageSize?: number) => {
    return useQuery({
      queryKey: ['attendance', 'student', studentId, page, pageSize],
      queryFn: () => attendanceApi.getStudentAttendance(studentId, page, pageSize),
      enabled: !!studentId,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useGetAttendanceSummary = (params: { date?: string; month?: string }) => {
    return useQuery({
      queryKey: ['attendance', 'summary', params],
      queryFn: () => attendanceApi.getAttendanceSummary(params),
      enabled: !!(params.date || params.month),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const useGetStudentSummary = (month: string, studentId?: number) => {
    return useQuery({
      queryKey: ['attendance', 'student-summary', month, studentId],
      queryFn: () => attendanceApi.getStudentSummary(month, studentId),
      enabled: !!month,
      staleTime: 10 * 60 * 1000,
    });
  };

  const useGetDateRangeAttendance = (startDate: string, endDate: string, page?: number, pageSize?: number) => {
    return useQuery({
      queryKey: ['attendance', 'date-range', startDate, endDate, page, pageSize],
      queryFn: () => attendanceApi.getDateRangeAttendance(startDate, endDate, page, pageSize),
      enabled: !!startDate && !!endDate,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useGetAttendanceStatistics = () => {
    return useQuery({
      queryKey: ['attendance', 'statistics'],
      queryFn: () => attendanceApi.getAttendanceStatistics(),
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };

  const createAttendanceMutation = useMutation({
    mutationFn: attendanceApi.createAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record attendance');
    },
  });

  const bulkCreateAttendanceMutation = useMutation({
    mutationFn: ({ records, date }: { records: any[]; date?: string }) =>
      attendanceApi.bulkCreateAttendance(records, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Bulk attendance created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create bulk attendance');
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      attendanceApi.updateAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update attendance');
    },
  });

  const deleteAttendanceMutation = useMutation({
    mutationFn: attendanceApi.deleteAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete attendance');
    },
  });

  return {
    // Queries
    useGetAttendance,
    useGetTodayAttendance,
    useGetStudentAttendance,
    useGetAttendanceSummary,
    useGetStudentSummary,
    useGetDateRangeAttendance,
    useGetAttendanceStatistics,
    // Mutations
    createAttendance: createAttendanceMutation.mutateAsync,
    bulkCreateAttendance: bulkCreateAttendanceMutation.mutateAsync,
    updateAttendance: updateAttendanceMutation.mutateAsync,
    deleteAttendance: deleteAttendanceMutation.mutateAsync,
    // Loading states
    isCreating: createAttendanceMutation.isPending,
    isUpdating: updateAttendanceMutation.isPending,
    isDeleting: deleteAttendanceMutation.isPending,
  };
};