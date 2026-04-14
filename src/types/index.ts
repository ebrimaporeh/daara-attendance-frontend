export interface User {
  id: number;
  first_name: string;
  last_name: string;
  fathers_first_name: string;
  phone: string;
  user_type: 'student' | 'admin';
  full_name?: string;
  email?: string;
  username?: string;
  date_joined?: string;
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

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}