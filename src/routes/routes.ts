export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Student routes
  STUDENT_DASHBOARD: '/student',
  STUDENT_ATTENDANCE: '/student/attendance',
  STUDENT_ATTENDANCE_DETAIL: '/student/attendance/$id',
  STUDENT_PROFILE: '/student/profile',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_STUDENT_DETAIL: '/admin/students/$id',
  ADMIN_ATTENDANCE: '/admin/attendance',
  ADMIN_MARK_ATTENDANCE: '/admin/mark',
  ADMIN_EDIT_ATTENDANCE: '/admin/attendance/$id/edit',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

export type RouteType = typeof ROUTES[keyof typeof ROUTES];