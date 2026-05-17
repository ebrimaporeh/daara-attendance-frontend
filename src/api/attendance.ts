// src/api/attendance.ts
import { apiClient } from "./client";
import {
  AttendanceRecord,
  AttendanceSummary,
  PaginatedResponse,
  AttendanceFilters,
} from "@/types";
import { 
  TodayAttendanceParams, 
  TodayAttendanceResponse, 
  CloseSessionParams, 
  CloseSessionResponse 
} from "@/hooks/useAttendance";

export const attendanceApi = {
  // Get all attendance records with pagination and filters
  getAttendance: (
    filters?: AttendanceFilters,
  ): Promise<PaginatedResponse<AttendanceRecord>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return apiClient.get(`/attendance/${queryString ? `?${queryString}` : ""}`);
  },

  // Get today's attendance with pagination and unmarked students
  getTodayAttendance: async (params?: TodayAttendanceParams): Promise<TodayAttendanceResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.page_size) searchParams.set("page_size", String(params.page_size));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    const url = `/attendance/today/${query ? `?${query}` : ""}`;

    const response = await apiClient.get(url);
    return response as TodayAttendanceResponse;
  },

  // Close session - mark all unmarked as absent
  closeSession: async (params?: CloseSessionParams): Promise<CloseSessionResponse> => {
    const response = await apiClient.post(
      "/attendance/mark-unmarked-as-absent/",
      params ?? {}
    );
    return response as CloseSessionResponse;
  },

  // Bulk mark attendance
  bulkMarkAttendance: (data: { 
    marks: Array<{ student_id: number; status: string; notes?: string }>; 
    date?: string 
  }): Promise<{ successful: any[]; failed: any[]; total: number }> => {
    return apiClient.post("/attendance/bulk-mark/", data);
  },

  // Get student attendance with pagination
  getStudentAttendance: (
    studentId: number,
    page?: number,
    pageSize?: number,
  ): Promise<PaginatedResponse<AttendanceRecord>> => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());
    const queryString = params.toString();
    return apiClient.get(
      `/attendance/student/${studentId}/${queryString ? `?${queryString}` : ""}`
    );
  },

  // Upsert attendance (create or update)
  upsertAttendance: (data: {
    student: number;
    status: string;
    date: string;
    notes?: string;
  }): Promise<AttendanceRecord> => {
    return apiClient.post("/attendance/upsert/", data);
  },

  // Create single attendance record
  createAttendance: (data: {
    student: number;
    status: string;
    notes?: string;
    date?: string;
  }): Promise<AttendanceRecord> => {
    return apiClient.post("/attendance/", data);
  },

  // Bulk create attendance records
  bulkCreateAttendance: (records: any[], date?: string): Promise<{ 
    message: string; 
    created: any[]; 
    errors: any[];
    total_processed: number;
    total_success: number;
    total_errors: number;
  }> => {
    return apiClient.post("/attendance/bulk-create/", { records, date });
  },

  // Update attendance record
  updateAttendance: (id: number, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    return apiClient.patch(`/attendance/${id}/`, data);
  },

  // Delete attendance record
  deleteAttendance: (id: number): Promise<void> => {
    return apiClient.delete(`/attendance/${id}/`);
  },

  // Get attendance summary (date or month)
  getAttendanceSummary: (params: {
    date?: string;
    month?: string;
  }): Promise<AttendanceSummary> => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiClient.get(`/attendance/summary/?${queryString}`);
  },

  // Get student summary for a month
  getStudentSummary: (month: string, studentId?: number): Promise<any[]> => {
    const params = new URLSearchParams({ month });
    if (studentId) params.append("student_id", studentId.toString());
    return apiClient.get(`/attendance/student-summary/?${params.toString()}`);
  },

  // Get attendance by date range with pagination
  getDateRangeAttendance: (
    startDate: string,
    endDate: string,
    page?: number,
    pageSize?: number,
  ): Promise<PaginatedResponse<AttendanceRecord>> => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());
    return apiClient.get(`/attendance/date-range/?${params.toString()}`);
  },

  // Get attendance statistics
  getAttendanceStatistics: (): Promise<any> => {
    return apiClient.get("/attendance/statistics/");
  },
};