import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import toast from 'react-hot-toast';

export const useAttendance = () => {
  const queryClient = useQueryClient();

  const useGetAttendance = () => {
    return useQuery({
      queryKey: ['attendance'],
      queryFn: () => attendanceApi.getAttendance(),
    });
  };

  const useGetTodayAttendance = () => {
    return useQuery({
      queryKey: ['attendance', 'today'],
      queryFn: () => attendanceApi.getTodayAttendance(),
    });
  };

  const useGetStudentAttendance = (studentId: number) => {
    return useQuery({
      queryKey: ['attendance', 'student', studentId],
      queryFn: () => attendanceApi.getStudentAttendance(studentId),
      enabled: !!studentId,
    });
  };

  const useGetAttendanceSummary = (params: { date?: string; month?: string }) => {
    return useQuery({
      queryKey: ['attendance', 'summary', params],
      queryFn: () => attendanceApi.getAttendanceSummary(params),
      enabled: !!(params.date || params.month),
    });
  };

  const useGetStudentSummary = (month: string) => {
    return useQuery({
      queryKey: ['attendance', 'student-summary', month],
      queryFn: () => attendanceApi.getStudentSummary(month),
      enabled: !!month,
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
    useGetAttendance,
    useGetTodayAttendance,
    useGetStudentAttendance,
    useGetAttendanceSummary,
    useGetStudentSummary,
    createAttendance: createAttendanceMutation.mutateAsync,
    bulkCreateAttendance: bulkCreateAttendanceMutation.mutateAsync,
    updateAttendance: updateAttendanceMutation.mutateAsync,
    deleteAttendance: deleteAttendanceMutation.mutateAsync,
    isCreating: createAttendanceMutation.isPending,
    isUpdating: updateAttendanceMutation.isPending,
    isDeleting: deleteAttendanceMutation.isPending,
  };
};