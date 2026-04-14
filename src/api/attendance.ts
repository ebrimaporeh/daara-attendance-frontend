import { apiClient } from './client';
import { AttendanceRecord, AttendanceSummary } from '@/types';

export const attendanceApi = {
  getAttendance: (): Promise<AttendanceRecord[]> => {
    return apiClient.get('/attendance/');
  },

  getTodayAttendance: () => {
    return apiClient.get('/attendance/today/');
  },

  getStudentAttendance: (studentId: number): Promise<AttendanceRecord[]> => {
    return apiClient.get(`/attendance/student/${studentId}/`);
  },

  createAttendance: (data: { student: number; status: string; notes?: string; date?: string }) => {
    return apiClient.post('/attendance/', data);
  },

  bulkCreateAttendance: (records: any[], date?: string) => {
    return apiClient.post('/attendance/bulk-create/', { records, date });
  },

  updateAttendance: (id: number, data: Partial<AttendanceRecord>) => {
    return apiClient.patch(`/attendance/${id}/`, data);
  },

  deleteAttendance: (id: number) => {
    return apiClient.delete(`/attendance/${id}/`);
  },

  getAttendanceSummary: (params: { date?: string; month?: string }): Promise<AttendanceSummary> => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiClient.get(`/attendance/summary/?${queryString}`);
  },

  getStudentSummary: (month: string): Promise<any[]> => {
    return apiClient.get(`/attendance/student-summary/?month=${month}`);
  },

  getDateRangeAttendance: (startDate: string, endDate: string): Promise<AttendanceRecord[]> => {
    return apiClient.get(`/attendance/date-range/?start_date=${startDate}&end_date=${endDate}`);
  },
};