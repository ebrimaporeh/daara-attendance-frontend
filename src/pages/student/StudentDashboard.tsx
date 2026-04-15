import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { useAttendance } from '@/hooks/useAttendance';
import { 
  Calendar, 
  TrendingUp, 
  Award, 
  Clock,
  CheckCircle,
  XCircle,
  CalendarDays,
  Eye,
  FileText,
  Heart,
  AlertCircle,
  ArrowRight,
  Target,
  Activity,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { formatDate, getStatusBadge } from '@/utils/dateUtils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface MonthlyData {
  month: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { useGetStudentAttendance, useGetAttendanceSummary } = useAttendance();
  
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  
  const { data: attendanceRecords, isLoading: recordsLoading } = useGetStudentAttendance(user?.id || 0);
  const { data: monthlySummary } = useGetAttendanceSummary({ month: selectedMonth });

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!attendanceRecords) return null;
    
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const excused = attendanceRecords.filter(r => r.status === 'excused').length;
    const sick = attendanceRecords.filter(r => r.status === 'sick').length;
    
    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
    
    // Calculate streak
    let streak = 0;
    const sortedRecords = [...attendanceRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    for (const record of sortedRecords) {
      if (record.status === 'present') streak++;
      else break;
    }
    
    // Calculate this month's stats
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthRecords = attendanceRecords.filter(r => r.date.startsWith(currentMonth));
    const thisMonthPresent = thisMonthRecords.filter(r => r.status === 'present').length;
    const thisMonthTotal = thisMonthRecords.length;
    const thisMonthRate = thisMonthTotal > 0 ? ((thisMonthPresent / thisMonthTotal) * 100).toFixed(1) : '0';
    
    // Monthly data for chart
    const monthlyDataMap: Record<string, MonthlyData> = {};
    attendanceRecords.forEach((record) => {
      const month = record.date.substring(0, 7);
      if (!monthlyDataMap[month]) {
        monthlyDataMap[month] = { month, present: 0, absent: 0, late: 0, total: 0 };
      }
      if (record.status === 'present') monthlyDataMap[month].present++;
      if (record.status === 'absent') monthlyDataMap[month].absent++;
      if (record.status === 'late') monthlyDataMap[month].late++;
      monthlyDataMap[month].total++;
    });
    
    const chartData = Object.values(monthlyDataMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
    
    // Weekly data for current week
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const weeklyData = weekDays.map(day => ({ day, present: 0, absent: 0, late: 0 }));
    
    return {
      total,
      present,
      absent,
      late,
      excused,
      sick,
      attendanceRate,
      streak,
      thisMonthRate,
      thisMonthPresent,
      thisMonthTotal,
      chartData,
      weeklyData,
    };
  }, [attendanceRecords]);

  const pieChartData = stats
    ? [
        { name: "Present", value: stats.present, color: "#10b981" },
        { name: "Absent", value: stats.absent, color: "#ef4444" },
        { name: "Late", value: stats.late, color: "#f59e0b" },
        { name: "Excused", value: stats.excused, color: "#3b82f6" },
        { name: "Sick", value: stats.sick, color: "#8b5cf6" },
      ].filter((item) => item.value > 0)
    : [];

  const getMotivationalMessage = () => {
    const rate = parseFloat(stats?.attendanceRate || '0');
    if (rate >= 90) {
      return { message: "Excellent! You're doing great! Keep it up! 🎉", icon: Smile, color: "text-success-600" };
    } else if (rate >= 75) {
      return { message: "Good job! Aim for 90% attendance to excel! 💪", icon: Smile, color: "text-primary-600" };
    } else if (rate >= 60) {
      return { message: "You can do better! Try to improve your attendance. 📈", icon: Meh, color: "text-warning-600" };
    } else {
      return { message: "Let's work on improving your attendance! You can do it! 🌟", icon: Frown, color: "text-error-600" };
    }
  };

  const motivationalMessage = getMotivationalMessage();
  const MotivationalIcon = motivationalMessage.icon;

  const recentRecords = attendanceRecords?.slice(0, 5) || [];

  if (recordsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p className="text-muted text-sm mt-1">Here's your attendance overview and progress</p>
        </div>
        <Link
          to="/student/attendance"
          className="btn btn-secondary flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Eye size={18} />
          View Full History
        </Link>
      </div>

      {/* Motivational Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${parseFloat(stats?.attendanceRate || '0') >= 90 ? 'from-success-50 to-success-100 dark:from-success-950/30 dark:to-success-900/30' : parseFloat(stats?.attendanceRate || '0') >= 75 ? 'from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/30' : 'from-warning-50 to-warning-100 dark:from-warning-950/30 dark:to-warning-900/30'} rounded-xl p-4 border border-border`}
      >
        <div className="flex items-center gap-3">
          <MotivationalIcon className={`h-8 w-8 ${motivationalMessage.color}`} />
          <div>
            <p className={`font-semibold ${motivationalMessage.color}`}>
              {motivationalMessage.message}
            </p>
            <p className="text-sm text-muted mt-0.5">
              Your overall attendance is {stats?.attendanceRate || 0}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Attendance Rate</p>
              <p className="text-2xl font-bold text-foreground">{stats?.attendanceRate || 0}%</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-950/30 p-3 rounded-full">
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats?.attendanceRate || 0}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Current Streak</p>
              <p className="text-2xl font-bold text-foreground">{stats?.streak || 0}</p>
            </div>
            <div className="bg-success-100 dark:bg-success-950/30 p-3 rounded-full">
              <Award className="h-5 w-5 text-success-600" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Consecutive days present</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Total Days</p>
              <p className="text-2xl font-bold text-foreground">{stats?.total || 0}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-950/30 p-3 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">School days attended</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">This Month</p>
              <p className="text-2xl font-bold text-foreground">{stats?.thisMonthRate || 0}%</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-950/30 p-3 rounded-full">
              <CalendarDays className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">
            {stats?.thisMonthPresent} / {stats?.thisMonthTotal} days
          </p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Your Attendance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted)" />
              <YAxis stroke="var(--muted)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="present"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                name="Present"
              />
              <Area
                type="monotone"
                dataKey="absent"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.3}
                name="Absent"
              />
              <Area
                type="monotone"
                dataKey="late"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
                name="Late"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-success-500 rounded"></div>
              <span className="text-muted">Present</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-error-500 rounded"></div>
              <span className="text-muted">Absent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-warning-500 rounded"></div>
              <span className="text-muted">Late</span>
            </div>
          </div>
        </motion.div>

        {/* Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity size={20} />
            Attendance Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
                outerRadius={80}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">Present:</span>
              <span className="font-semibold text-success-600">{stats?.present || 0} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Absent:</span>
              <span className="font-semibold text-error-600">{stats?.absent || 0} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Late:</span>
              <span className="font-semibold text-warning-600">{stats?.late || 0} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Excused:</span>
              <span className="font-semibold text-primary-600">{stats?.excused || 0} days</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock size={20} />
              Recent Activity
            </h3>
            <Link
              to="/student/attendance"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentRecords.map((record) => {
              const badge = getStatusBadge(record.status);
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-surface-hover rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">{formatDate(record.date)}</p>
                    {record.notes && (
                      <p className="text-xs text-muted mt-0.5">{record.notes}</p>
                    )}
                  </div>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
            {recentRecords.length === 0 && (
              <div className="text-center py-8 text-muted">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No attendance records yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions & Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target size={20} />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/student/attendance"
                className="btn btn-secondary w-full justify-center flex items-center gap-2"
              >
                <Eye size={18} />
                View Full Attendance History
              </Link>
              <Link
                to="/student/profile"
                className="btn btn-secondary w-full justify-center flex items-center gap-2"
              >
                <FileText size={18} />
                Update Profile
              </Link>
            </div>
          </div>

          {/* Attendance Tips */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award size={20} />
              Attendance Tips
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-success-100 dark:bg-success-950/30 p-2 rounded-lg">
                  <CheckCircle size={16} className="text-success-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Be Consistent</p>
                  <p className="text-sm text-muted">Regular attendance helps you memorize better</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-warning-100 dark:bg-warning-950/30 p-2 rounded-lg">
                  <Clock size={16} className="text-warning-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Arrive on Time</p>
                  <p className="text-sm text-muted">Punctuality is key to success</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 dark:bg-primary-950/30 p-2 rounded-lg">
                  <Heart size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Communicate</p>
                  <p className="text-sm text-muted">Inform your teacher about any absences</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Achievement Badge */}
      {stats?.streak && stats.streak >= 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-full">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                {stats.streak} Day Streak! 🔥
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                You're on fire! Keep up the great attendance!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress to Next Milestone */}
      {stats && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target size={20} />
            Your Progress
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">Next Milestone: 90% Attendance</span>
                <span className="font-medium text-foreground">{stats.attendanceRate}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (parseFloat(stats.attendanceRate) / 90) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted mt-2">
                {90 - parseFloat(stats.attendanceRate) > 0 
                  ? `${(90 - parseFloat(stats.attendanceRate)).toFixed(1)}% more to reach 90% attendance`
                  : "You've reached the 90% milestone! 🎉"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;