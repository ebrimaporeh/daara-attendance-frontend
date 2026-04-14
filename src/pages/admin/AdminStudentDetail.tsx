import React, { useState } from 'react';
import { useParams, Link, useRouter } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Heart,
  TrendingUp,
  Award,
  Activity,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  MessageSquare,
  FileText,
  PieChart,
  BarChart3,
  Calendar as CalendarIcon,
  GraduationCap,
  Star,
  Shield,
  BookOpen,
  Target,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ChevronRight
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useAttendance } from '@/hooks/useAttendance';
import { formatDate, getStatusBadge, getAttendanceColor } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const STATUS_CONFIG = {
  present: { label: 'Present', color: '#10b981', icon: CheckCircle },
  absent: { label: 'Absent', color: '#ef4444', icon: XCircle },
  late: { label: 'Late', color: '#f59e0b', icon: Clock },
  excused: { label: 'Excused', color: '#3b82f6', icon: AlertCircle },
  sick: { label: 'Sick', color: '#8b5cf6', icon: Heart }
};

const AdminStudentDetailPage: React.FC = () => {
  const { id } = useParams({ from: '/admin/students/$id' });
  const router = useRouter();
  const queryClient = useQueryClient();
  const { useGetUser, changeUserRole } = useUsers();
  const { useGetStudentAttendance, deleteAttendance } = useAttendance();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'performance' | 'notes'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDeleteRecordModal, setShowDeleteRecordModal] = useState(false);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  
  const studentId = parseInt(id as string);
  
  const { data: student, isLoading: studentLoading } = useGetUser(studentId);
  const { data: attendanceRecords, isLoading: attendanceLoading } = useGetStudentAttendance(studentId);
  
  const deleteAttendanceMutation = useMutation({
    mutationFn: deleteAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'student', studentId] });
      toast.success('Attendance record deleted successfully');
      setShowDeleteRecordModal(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete attendance record');
    },
  });
  
  const changeRoleMutation = useMutation({
    mutationFn: ({ id, userType }: { id: number; userType: 'student' | 'admin' }) =>
      changeUserRole({ id, userType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', studentId] });
      toast.success('Student status updated successfully');
    },
  });

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
    
    // Calculate current streak
    let streak = 0;
    const sortedRecords = [...attendanceRecords].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (const record of sortedRecords) {
      if (record.status === 'present') {
        streak++;
      } else {
        break;
      }
    }
    
    // Monthly data for chart
    const monthlyData = attendanceRecords.reduce((acc: any, record) => {
      const month = record.date.substring(0, 7);
      if (!acc[month]) {
        acc[month] = { month, present: 0, absent: 0, late: 0, total: 0 };
      }
      acc[month][record.status]++;
      acc[month].total++;
      return acc;
    }, {});
    
    const chartData = Object.values(monthlyData).sort((a: any, b: any) => 
      a.month.localeCompare(b.month)
    ).slice(-6);
    
    return {
      total,
      present,
      absent,
      late,
      excused,
      sick,
      attendanceRate,
      streak,
      chartData,
      bestMonth: chartData.reduce((best: any, current: any) => {
        const rate = (current.present / current.total) * 100;
        const bestRate = best ? (best.present / best.total) * 100 : 0;
        return rate > bestRate ? current : best;
      }, null)
    };
  }, [attendanceRecords]);

  const pieChartData = stats ? [
    { name: 'Present', value: stats.present, color: STATUS_CONFIG.present.color },
    { name: 'Absent', value: stats.absent, color: STATUS_CONFIG.absent.color },
    { name: 'Late', value: stats.late, color: STATUS_CONFIG.late.color },
    { name: 'Excused', value: stats.excused, color: STATUS_CONFIG.excused.color },
    { name: 'Sick', value: stats.sick, color: STATUS_CONFIG.sick.color },
  ].filter(item => item.value > 0) : [];

  const handleDeleteRecord = async () => {
    if (selectedRecord) {
      await deleteAttendanceMutation.mutateAsync(selectedRecord.id);
    }
  };

  const exportAttendanceReport = () => {
    if (!attendanceRecords) return;
    
    const headers = ['Date', 'Status', 'Notes', 'Marked By'];
    const csvData = attendanceRecords.map(record => [
      record.date,
      record.status,
      record.notes || '',
      record.marked_by_name || 'System'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student?.first_name}_${student?.last_name}_attendance.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Attendance report exported');
  };

  if (studentLoading || attendanceLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="card p-12 text-center">
        <User className="h-12 w-12 text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Student Not Found</h3>
        <p className="text-muted mb-4">The student you're looking for doesn't exist.</p>
        <Link to="/admin/students" className="btn btn-primary">
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/students"
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-muted text-sm mt-1">Student Profile & Attendance</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportAttendanceReport}
            className="btn btn-secondary p-2 md:px-4 md:py-2"
            title="Export Report"
          >
            <Download size={18} />
            <span className="hidden md:inline ml-2">Export</span>
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="btn btn-secondary p-2 md:px-4 md:py-2"
          >
            <Edit size={18} />
            <span className="hidden md:inline ml-2">Edit</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-danger p-2 md:px-4 md:py-2"
          >
            <Trash2 size={18} />
            <span className="hidden md:inline ml-2">Delete</span>
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-3xl md:text-4xl font-bold">
                {student.first_name[0]}{student.last_name[0]}
              </span>
            </div>
            
            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {student.first_name} {student.last_name}
              </h2>
              <p className="text-primary-100 mt-1">d/o {student.fathers_first_name}</p>
              <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs text-white">
                  <Calendar size={12} />
                  Joined {formatDate(student.date_joined || new Date().toISOString())}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  student.is_active !== false 
                    ? 'bg-success-500/20 text-success-100'
                    : 'bg-error-500/20 text-error-100'
                }`}>
                  {student.is_active !== false ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {student.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 min-w-[200px]">
              <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stats?.attendanceRate || 0}%</div>
                <div className="text-xs text-primary-100">Attendance</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stats?.streak || 0}</div>
                <div className="text-xs text-primary-100">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Info Bar */}
        <div className="p-4 bg-surface border-b border-border grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="text-muted" />
            <span className="text-foreground">{student.phone}</span>
          </div>
          {student.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail size={16} className="text-muted" />
              <span className="text-foreground">{student.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Users size={16} className="text-muted" />
            <span className="text-foreground">Student ID: #{student.id}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'attendance', label: 'Attendance', icon: CalendarIcon },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'notes', label: 'Notes', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-all relative ${
                  isActive 
                    ? 'text-primary-600' 
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="card p-4 text-center">
              <div className="text-success-600 mb-2">
                <CheckCircle size={24} className="mx-auto" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.present}</div>
              <div className="text-xs text-muted">Present Days</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-error-600 mb-2">
                <XCircle size={24} className="mx-auto" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.absent}</div>
              <div className="text-xs text-muted">Absent Days</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-warning-600 mb-2">
                <Clock size={24} className="mx-auto" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.late}</div>
              <div className="text-xs text-muted">Late Arrivals</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-primary-600 mb-2">
                <AlertCircle size={24} className="mx-auto" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.excused}</div>
              <div className="text-xs text-muted">Excused</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-accent-600 mb-2">
                <Heart size={24} className="mx-auto" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.sick}</div>
              <div className="text-xs text-muted">Sick Days</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Trend Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Attendance Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted)" />
                  <YAxis stroke="var(--muted)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--surface)', 
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="present" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="absent" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="late" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.3}
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
            </div>

            {/* Distribution Pie Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <PieChart size={20} />
                Attendance Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Achievements & Highlights */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award size={20} />
              Achievements & Highlights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-success-50 dark:bg-success-950/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <ThumbsUp className="text-success-600" size={20} />
                  <span className="font-semibold text-foreground">Best Month</span>
                </div>
                <p className="text-2xl font-bold text-success-600">
                  {stats.bestMonth?.month || 'N/A'}
                </p>
                <p className="text-sm text-muted mt-1">
                  {stats.bestMonth ? ((stats.bestMonth.present / stats.bestMonth.total) * 100).toFixed(0) : 0}% attendance
                </p>
              </div>
              <div className="bg-primary-50 dark:bg-primary-950/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="text-primary-600" size={20} />
                  <span className="font-semibold text-foreground">Current Streak</span>
                </div>
                <p className="text-2xl font-bold text-primary-600">{stats.streak} days</p>
                <p className="text-sm text-muted mt-1">Consecutive attendance</p>
              </div>
              <div className="bg-warning-50 dark:bg-warning-950/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className="text-warning-600" size={20} />
                  <span className="font-semibold text-foreground">Total Days</span>
                </div>
                <p className="text-2xl font-bold text-warning-600">{stats.total}</p>
                <p className="text-sm text-muted mt-1">School days attended</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Date Range Filter */}
          <div className="card p-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="flex gap-2">
                {['week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range as any)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      dateRange === range
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface text-muted hover:text-foreground border border-border'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={exportAttendanceReport}
                className="btn btn-secondary flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                Export All
              </button>
            </div>
          </div>

          {/* Attendance Records List */}
          <div className="space-y-3">
            {attendanceRecords?.slice(0, dateRange === 'week' ? 7 : undefined).map((record) => {
              const badge = getStatusBadge(record.status);
              const Icon = STATUS_CONFIG[record.status as keyof typeof STATUS_CONFIG]?.icon || CheckCircle;
              
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${badge.color.replace('text', 'bg').replace('800', '100')}`}>
                        <Icon size={16} className={badge.color} />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {formatDate(record.date)}
                        </div>
                        <div className="text-xs text-muted">
                          Marked by: {record.marked_by_name || 'System'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                      {record.notes && (
                        <span className="text-xs text-muted max-w-xs truncate">
                          📝 {record.notes}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowDeleteRecordModal(true);
                        }}
                        className="p-1 text-error-600 hover:bg-error-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {attendanceRecords?.length === 0 && (
              <div className="card p-12 text-center">
                <CalendarIcon className="h-12 w-12 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Attendance Records</h3>
                <p className="text-muted">No attendance records found for this student.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && stats && (
        <div className="space-y-6">
          {/* Monthly Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.chartData.slice().reverse().map((month: any, idx: number) => {
              const rate = (month.present / month.total) * 100;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="card p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{month.month}</h4>
                      <p className="text-xs text-muted">{month.total} school days</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rate >= 90 ? 'bg-success-100 text-success-800' :
                      rate >= 75 ? 'bg-warning-100 text-warning-800' :
                      'bg-error-100 text-error-800'
                    }`}>
                      {rate.toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-muted mb-1">
                        <span>Present</span>
                        <span>{month.present}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-success-500 h-1.5 rounded-full"
                          style={{ width: `${(month.present / month.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted mb-1">
                        <span>Absent</span>
                        <span>{month.absent}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-error-500 h-1.5 rounded-full"
                          style={{ width: `${(month.absent / month.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted mb-1">
                        <span>Late</span>
                        <span>{month.late}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-warning-500 h-1.5 rounded-full"
                          style={{ width: `${(month.late / month.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText size={20} />
              Student Notes
            </h3>
            <button className="btn btn-primary text-sm">
              Add Note
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-surface-hover rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={14} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Admin User</p>
                    <p className="text-xs text-muted">April 13, 2026</p>
                  </div>
                </div>
                <button className="text-muted hover:text-foreground">
                  <MoreVertical size={16} />
                </button>
              </div>
              <p className="text-sm text-foreground mt-2">
                Student is showing excellent progress in Quran memorization. 
                Needs encouragement for punctuality.
              </p>
            </div>
            
            <div className="bg-surface-hover rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={14} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Teacher</p>
                    <p className="text-xs text-muted">April 10, 2026</p>
                  </div>
                </div>
                <button className="text-muted hover:text-foreground">
                  <MoreVertical size={16} />
                </button>
              </div>
              <p className="text-sm text-foreground mt-2">
                Participated actively in class discussions. Good understanding of Tajweed rules.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowEditModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface rounded-xl shadow-xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Edit Student</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover"
                >
                  <XCircle size={20} />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    className="input"
                    defaultValue={student.first_name}
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    className="input"
                    defaultValue={student.last_name}
                  />
                </div>
                <div>
                  <label className="label">Father's Name</label>
                  <input
                    type="text"
                    className="input"
                    defaultValue={student.fathers_first_name}
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    className="input"
                    defaultValue={student.phone}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    defaultValue={student.email || ''}
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    defaultValue={student.is_active !== false ? 'active' : 'inactive'}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-surface border-t border-border p-4 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success('Student updated successfully');
                    setShowEditModal(false);
                  }}
                  className="flex-1 btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Student Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowDeleteModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface rounded-xl shadow-xl z-50 p-6"
            >
              <div className="text-center mb-4">
                <div className="mx-auto w-12 h-12 bg-error-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="h-6 w-6 text-error-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Delete Student</h3>
                <p className="text-muted text-sm">
                  Are you sure you want to delete {student.first_name} {student.last_name}? 
                  This action cannot be undone and will remove all attendance records.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success('Student deleted');
                    setShowDeleteModal(false);
                    router.navigate({ to: '/admin/students' });
                  }}
                  className="flex-1 btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Record Modal */}
      <AnimatePresence>
        {showDeleteRecordModal && selectedRecord && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowDeleteRecordModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface rounded-xl shadow-xl z-50 p-6"
            >
              <div className="text-center mb-4">
                <div className="mx-auto w-12 h-12 bg-error-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="h-6 w-6 text-error-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Delete Attendance Record</h3>
                <p className="text-muted text-sm">
                  Are you sure you want to delete the attendance record for {formatDate(selectedRecord.date)}?
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteRecordModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRecord}
                  disabled={deleteAttendanceMutation.isPending}
                  className="flex-1 btn btn-danger"
                >
                  {deleteAttendanceMutation.isPending ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStudentDetailPage;