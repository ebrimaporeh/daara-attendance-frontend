import { createRoute } from '@tanstack/react-router';
// import { rootRoute } from '@/routes/root';
import { rootRoute } from '../root';

// Admin layout
// import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminLayout } from '../../components/Layout/AdminLayout';

// Admin pages
// import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminDashboard from '../../pages/admin/AdminDashboard';
// import AdminStudents from '@/pages/admin/Students';
// import AdminAttendance from '@/pages/admin/Attendance';
import MarkAttendance from '@/pages/admin/MarkAttendancePage';
import AdminAttendancePage from '@/pages/admin/AdminAttendancePage';
import AdminStudentsPage from '@/pages/admin/AdminStudents';
import AdminStudentDetailPage from '@/pages/admin/AdminStudentDetail';
import AdminProfile from '@/pages/admin/AdminProfile';
// import AdminReports from '@/pages/admin/Reports';
// import AdminSettings from '@/pages/admin/Settings';
// import StudentDetailPage from '@/pages/admin/StudentDetailPage';
// import EditAttendancePage from '@/pages/admin/EditAttendancePage';

// Create admin layout route
export const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin',
  component: AdminLayout,
});

// ---------- Dashboard ----------
export const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/',
  component: AdminDashboard,
});

export const adminMarkAttendancedRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/mark',
  component: MarkAttendance,
});


export const adminAttendancedRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/attendance',
  component: AdminAttendancePage,
});

export const adminStudentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/students',
  component: AdminStudentsPage,
});

export const adminStudentDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/students/$id',
  component: AdminStudentDetailPage,
});

// ---------- Students Management ----------
// export const adminStudentsRoute = createRoute({
//   getParentRoute: () => adminLayoutRoute,
//   path: 'students',
//   component: AdminStudents,
// });

// export const adminStudentDetailRoute = createRoute({
//   getParentRoute: () => adminLayoutRoute,
//   path: 'students/$id',
//   component: StudentDetailPage,
// });

// // ---------- Attendance Management ----------
// export const adminAttendanceRoute = createRoute({
//   getParentRoute: () => adminLayoutRoute,
//   path: 'attendance',
//   component: AdminAttendance,
// });

// export const adminMarkAttendanceRoute = createRoute({
//   getParentRoute: () => adminLayoutRoute,
//   path: 'attendance/mark',
//   component: MarkAttendance,
// });

// export const adminEditAttendanceRoute = createRoute({
//   getParentRoute: () => adminLayoutRoute,
//   path: 'attendance/$id/edit',
//   component: EditAttendancePage,
// });

// // ---------- Reports ----------
// export const adminReportsRoute = createRoute({
//   getParentRoute: () => adminLayoutRoute,
//   path: 'reports',
//   component: AdminReports,
// });

// // ---------- Profile & Settings ----------
export const adminProfileRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'profile',
  component: AdminProfile,
});

// export const adminSettingsRoute = createRoute({
//   getParentRoute: () => adminLayoutRoute,
//   path: 'settings',
//   component: AdminSettings,
// });

// Export all admin child routes
export const adminChildRoutes = [
  adminDashboardRoute,
  adminMarkAttendancedRoute,
  adminAttendancedRoute,
  adminStudentsRoute,
  adminStudentDetailRoute,
//   adminStudentsRoute,
//   adminStudentDetailRoute,
//   adminAttendanceRoute,
//   adminMarkAttendanceRoute,
//   adminEditAttendanceRoute,
//   adminReportsRoute,
  adminProfileRoute,
//   adminSettingsRoute,
];