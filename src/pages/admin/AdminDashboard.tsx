import React from 'react';
import { motion } from 'framer-motion';
import { useAttendance } from '@/hooks/useAttendance';
import { useUsers } from '@/hooks/useUsers';
import { Users, CalendarCheck, TrendingUp, Award } from 'lucide-react';
import { Link } from '@tanstack/react-router';

// Define the response type
interface TodayAttendanceResponse {
  date: string;
  summary: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    sick: number;
    total: number;
    attendance_rate: number;
  };
  records: Array<{
    id: number;
    student_name: string;
    date: string;
    status: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { useGetStudents } = useUsers();
  const { useGetTodayAttendance } = useAttendance();
  
  const { data: students, isLoading: studentsLoading } = useGetStudents();
  const { data: todayAttendanceRaw, isLoading: attendanceLoading } = useGetTodayAttendance();
  
  // Type assertion for todayAttendance
  const todayAttendance = todayAttendanceRaw as TodayAttendanceResponse | undefined;
  
  const stats = [
    {
      label: 'Total Students',
      value: students?.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-950/30',
    },
    {
      label: "Today's Present",
      value: todayAttendance?.summary?.present || 0,
      icon: CalendarCheck,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-950/30',
    },
    {
      label: 'Attendance Rate',
      value: todayAttendance?.summary?.attendance_rate || 0,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-950/30',
      suffix: '%',
    },
    {
      label: 'Total Records',
      value: todayAttendance?.summary?.total || 0,
      icon: Award,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-950/30',
    },
  ];

  if (studentsLoading || attendanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted mt-1">Overview of school attendance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface rounded-xl shadow-sm p-6 border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stat.value}{stat.suffix || ''}
                </p>
              </div>
              <div className={`${stat.bg} p-3 rounded-full`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {todayAttendance?.records?.slice(0, 5).map((record) => (
              <div 
                key={record.id} 
                className="flex justify-between items-center p-3 bg-background rounded-lg hover:bg-surface-hover transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{record.student_name}</p>
                  <p className="text-sm text-muted">{record.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  record.status === 'present' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300' 
                    : record.status === 'absent' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300'
                      : record.status === 'late'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-300'
                }`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
              </div>
            ))}
            {(!todayAttendance?.records || todayAttendance.records.length === 0) && (
              <div className="text-center text-muted py-8">
                <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
                <Link to="/admin/attendance/mark" className="text-primary-600 text-sm mt-2 inline-block">
                  Mark attendance now →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/admin/attendance/mark" 
              className="btn btn-primary w-full justify-center flex items-center gap-2"
            >
              <CalendarCheck size={18} />
              Mark Today's Attendance
            </Link>
            <Link 
              to="/admin/attendance" 
              className="btn btn-secondary w-full justify-center flex items-center gap-2"
            >
              <TrendingUp size={18} />
              View Attendance Records
            </Link>
            <Link 
              to="/admin/students" 
              className="btn btn-secondary w-full justify-center flex items-center gap-2"
            >
              <Users size={18} />
              Manage Students
            </Link>
          </div>
          
          {/* Quick Stats Footer */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {todayAttendance?.summary?.attendance_rate || 0}%
                </p>
                <p className="text-xs text-muted">Today's Attendance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success-600">
                  {todayAttendance?.summary?.present || 0}
                </p>
                <p className="text-xs text-muted">Present Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Card - Optional */}
      <div className="bg-linear-to-r from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/30 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-3 rounded-full">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Quick Tip</h3>
              <p className="text-sm text-muted">
                Use the "Mark Attendance" button to quickly record daily attendance for all students.
              </p>
            </div>
          </div>
          <Link 
            to="/admin/attendance/mark" 
            className="btn btn-primary whitespace-nowrap"
          >
            Mark Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;