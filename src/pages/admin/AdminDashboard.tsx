import React from 'react';
import { motion } from 'framer-motion';
import { useAttendance } from '@/hooks/useAttendance';
import { useUsers } from '@/hooks/useUsers';
import { Users, CalendarCheck, TrendingUp, Award } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { useGetStudents } = useUsers();
  const { useGetTodayAttendance } = useAttendance();
  
  const { data: students, isLoading: studentsLoading } = useGetStudents();
  const { data: todayAttendance, isLoading: attendanceLoading } = useGetTodayAttendance();

  const stats = [
    {
      label: 'Total Students',
      value: students?.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: "Today's Present",
      value: todayAttendance?.summary?.present || 0,
      icon: CalendarCheck,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Attendance Rate',
      value: todayAttendance?.summary?.attendance_rate || 0,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      suffix: '%',
    },
    {
      label: 'Total Records',
      value: todayAttendance?.summary?.total || 0,
      icon: Award,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of school attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {todayAttendance?.records?.slice(0, 5).map((record: any) => (
              <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{record.student_name}</p>
                  <p className="text-sm text-gray-500">{record.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  record.status === 'present' ? 'bg-green-100 text-green-800' :
                  record.status === 'absent' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full btn-primary">Mark Today's Attendance</button>
            <button className="w-full btn-secondary">View Attendance Reports</button>
            <button className="w-full btn-secondary">Manage Students</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;