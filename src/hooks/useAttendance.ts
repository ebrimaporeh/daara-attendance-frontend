// src/hooks/useAttendance.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import { AttendanceRecord, AttendanceSummary, PaginatedResponse, AttendanceFilters } from '@/types';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Param types for today's attendance
// ---------------------------------------------------------------------------
export interface TodayAttendanceParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
}

// Response type for today's attendance (matches what your backend returns)
export interface TodayAttendanceResponse {
  date: string;
  summary: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    sick: number;
    unmarked: number;
    marked: number;
    total_students: number;
    completion_rate: number;
  };
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
  students: Array<{
    student_id: number;
    student_name: string;
    student_phone: string;
    record_id: number | null;
    status: 'present' | 'absent' | 'late' | 'excused' | 'sick' | 'unmarked';
    notes: string;
    marked_by_name: string | null;
    marked_at: string | null;
    has_record: boolean;
  }>;
}

export interface CloseSessionParams {
  date?: string;
  notes?: string;
}

export interface CloseSessionResponse {
  message: string;
  marked_count: number;
  total_students: number;
  already_marked: number;
  records: Array<{
    student_id: number;
    student_name: string;
    record_id: number;
  }>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useAttendance = () => {
  const queryClient = useQueryClient();

  const useGetAttendance = (
    filters?: AttendanceFilters,
    options?: UseQueryOptions<PaginatedResponse<AttendanceRecord>>,
  ) => {
    return useQuery({
      queryKey: ['attendance', filters],
      queryFn: () => attendanceApi.getAttendance(filters),
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  // Get today's attendance with unmarked students
  const useGetTodayAttendance = (params?: TodayAttendanceParams) => {
    return useQuery<TodayAttendanceResponse>({
      queryKey: ['attendance', 'today', params],
      queryFn: () => attendanceApi.getTodayAttendance(params),
      staleTime: 30 * 1000,
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
      staleTime: 10 * 60 * 1000,
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

  const useGetDateRangeAttendance = (
    startDate: string,
    endDate: string,
    page?: number,
    pageSize?: number,
  ) => {
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
      staleTime: 15 * 60 * 1000,
    });
  };

  // Mutations
  const upsertAttendanceMutation = useMutation({
    mutationFn: attendanceApi.upsertAttendance,
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save attendance');
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: (params: CloseSessionParams) => attendanceApi.closeSession(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to close session');
    },
  });

  const bulkMarkAttendanceMutation = useMutation({
    mutationFn: attendanceApi.bulkMarkAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Bulk marking completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to bulk mark');
    },
  });

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
    upsertAttendance: upsertAttendanceMutation.mutateAsync,
    closeSession: closeSessionMutation.mutateAsync,
    bulkMarkAttendance: bulkMarkAttendanceMutation.mutateAsync,
    // Loading states
    isCreating: createAttendanceMutation.isPending,
    isUpdating: updateAttendanceMutation.isPending,
    isDeleting: deleteAttendanceMutation.isPending,
    isUpserting: upsertAttendanceMutation.isPending,
    isClosingSession: closeSessionMutation.isPending,
    isBulkMarking: bulkMarkAttendanceMutation.isPending,
  };
};