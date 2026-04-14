import { createRoute } from '@tanstack/react-router';
// import { rootRoute } from '@/routes/root';
import { rootRoute } from '../root';
// Student layout
// import { StudentLayout } from '@/pages/student/StudentLayout';
import { StudentLayout } from '../../components/Layout/StudentLayout';

// Student pages
// import StudentDashboard from '@/pages/student/Dashboard';
import { StudentDashboard } from '../../pages/student/StudentDashboard';

// import StudentAttendance from '@/pages/student/Attendance';
// import StudentProfile from '@/pages/student/Profile';
// import StudentAttendanceDetail from '@/pages/student/AttendanceDetail';

// Create student layout route
export const studentLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'student',
  component: StudentLayout,
});

// ---------- Dashboard ----------
export const studentDashboardRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/',
  component: StudentDashboard,
});

// ---------- Attendance ----------
// export const studentAttendanceRoute = createRoute({
//   getParentRoute: () => studentLayoutRoute,
//   path: 'attendance',
//   component: StudentAttendance,
// });

// export const studentAttendanceDetailRoute = createRoute({
//   getParentRoute: () => studentLayoutRoute,
//   path: 'attendance/$id',
//   component: StudentAttendanceDetail,
// });

// // ---------- Profile ----------
// export const studentProfileRoute = createRoute({
//   getParentRoute: () => studentLayoutRoute,
//   path: 'profile',
//   component: StudentProfile,
// });

// Export all student child routes
export const studentChildRoutes = [
  studentDashboardRoute,
//   studentAttendanceRoute,
//   studentAttendanceDetailRoute,
//   studentProfileRoute,
];