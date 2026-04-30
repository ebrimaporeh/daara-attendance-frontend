// src/types/index.ts
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  fathers_first_name: string;
  phone: string;
  email: string | null;
  user_type: 'student' | 'admin';
  date_joined: string;
  full_name?: string;
  username?: string;
  last_login?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface AttendanceRecord {
  id: number;
  student: number;
  student_name: string;
  student_phone: string;
  marked_by: number;
  marked_by_name: string;
  date: string;
  status: 'present' | 'absent' | 'excused' | 'late' | 'sick';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSummary {
  date?: string;
  month?: string;
  present: number;
  absent: number;
  excused: number;
  late: number;
  sick: number;
  total: number;
  attendance_rate?: number;
  month_name?: string;
  year?: number;
  unique_students?: number;
  total_records?: number;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface ApiError {
  error: string;
  message?: string;
  [key: string]: any;
}

export interface PaginationMetadata {
  current_page: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_previous: boolean;
  page_size: number;
}

export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: T[];
  pagination: PaginationMetadata;
}

// Base filter interface
export interface BaseFilters {
  page?: number;
  page_size?: number;
  search?: string;
}

// Attendance specific filters
export interface AttendanceFilters extends BaseFilters {
  status?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  student_id?: number;
}

// User specific filters
export interface UserFilters extends BaseFilters {
  user_type?: 'student' | 'admin';
  is_active?: boolean;
}