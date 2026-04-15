import React, { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useAttendance } from '@/hooks/useAttendance';
import {
  Calendar,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Heart,
  TrendingUp,
  ArrowLeft,
  FileText,
  PieChart,
  CalendarDays,
  Eye
} from 'lucide-react';
import { formatDate, getStatusBadge } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const STATUS_CONFIG = {
  present: { label: "Present", color: "#10b981", icon: CheckCircle, bgColor: "bg-green-100 dark:bg-green-950/30", textColor: "text-green-800 dark:text-green-300" },
  absent: { label: "Absent", color: "#ef4444", icon: XCircle, bgColor: "bg-red-100 dark:bg-red-950/30", textColor: "text-red-800 dark:text-red-300" },
  late: { label: "Late", color: "#f59e0b", icon: Clock, bgColor: "bg-yellow-100 dark:bg-yellow-950/30", textColor: "text-yellow-800 dark:text-yellow-300" },
  excused: { label: "Excused", color: "#3b82f6", icon: AlertCircle, bgColor: "bg-blue-100 dark:bg-blue-950/30", textColor: "text-blue-800 dark:text-blue-300" },
  sick: { label: "Sick", color: "#8b5cf6", icon: Heart, bgColor: "bg-purple-100 dark:bg-purple-950/30", textColor: "text-purple-800 dark:text-purple-300" },
};

const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const { useGetStudentAttendance, useGetAttendanceSummary } = useAttendance();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'stats'>('list');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  const itemsPerPage = 15;

  const { data: attendanceRecords, isLoading: recordsLoading } = useGetStudentAttendance(user?.id || 0);
  const { data: monthlySummary } = useGetAttendanceSummary({ month: selectedMonth });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!attendanceRecords) return null;
    
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const excused = attendanceRecords.filter(r => r.status === 'excused').length;
    const sick = attendanceRecords.filter(r => r.status === 'sick').length;
    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
    
    // Monthly data for chart
    const monthlyDataMap: Record<string, any> = {};
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
      .sort((a: any, b: any) => a.month.localeCompare(b.month))
      .slice(-6);
    
    return { total, present, absent, late, excused, sick, attendanceRate, chartData };
  }, [attendanceRecords]);

  // Filter records
  const filteredRecords = useMemo(() => {
    if (!attendanceRecords) return [];
    
    let records = [...attendanceRecords];
    
    if (statusFilter !== 'all') {
      records = records.filter(r => r.status === statusFilter);
    }
    
    if (searchQuery) {
      records = records.filter(r => 
        r.date.includes(searchQuery) ||
        r.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendanceRecords, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pieChartData = stats
    ? [
        { name: "Present", value: stats.present, color: STATUS_CONFIG.present.color },
        { name: "Absent", value: stats.absent, color: STATUS_CONFIG.absent.color },
        { name: "Late", value: stats.late, color: STATUS_CONFIG.late.color },
        { name: "Excused", value: stats.excused, color: STATUS_CONFIG.excused.color },
        { name: "Sick", value: stats.sick, color: STATUS_CONFIG.sick.color },
      ].filter((item) => item.value > 0)
    : [];

  const exportToCSV = () => {
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
    a.download = `my_attendance_full_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Attendance report exported successfully');
  };

  if (recordsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/student/dashboard"
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Attendance</h1>
            <p className="text-muted text-sm mt-1">View your complete attendance history</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="btn btn-secondary flex items-center gap-2"
            disabled={!attendanceRecords || attendanceRecords.length === 0}
          >
            <Download size={18} />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Overall Attendance</p>
                <p className="text-2xl font-bold text-foreground">{stats.attendanceRate}%</p>
              </div>
              <div className="bg-primary-100 dark:bg-primary-950/30 p-3 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.attendanceRate}%` }}
              />
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Total Days</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-950/30 p-3 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Present</p>
                <p className="text-2xl font-bold text-success-600">{stats.present}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-950/30 p-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Absent</p>
                <p className="text-2xl font-bold text-error-600">{stats.absent}</p>
              </div>
              <div className="bg-red-100 dark:bg-red-950/30 p-3 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Mode Toggle & Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search by date or notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-9"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
              <option value="sick">Sick</option>
            </select>
            
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input"
            >
              <option value={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}>
                Current Month
              </option>
              <option value={`${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, '0')}`}>
                Previous Month
              </option>
            </select>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-primary-600 text-white' 
                : 'bg-surface text-muted hover:text-foreground border border-border'
            }`}
          >
            <FileText size={18} />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'calendar' 
                ? 'bg-primary-600 text-white' 
                : 'bg-surface text-muted hover:text-foreground border border-border'
            }`}
          >
            <CalendarDays size={18} />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'stats' 
                ? 'bg-primary-600 text-white' 
                : 'bg-surface text-muted hover:text-foreground border border-border'
            }`}
          >
            <PieChart size={18} />
            <span>Statistics</span>
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-muted font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Notes</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Marked By</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((record, index) => {
                  const badge = getStatusBadge(record.status);
                  const Icon = STATUS_CONFIG[record.status as keyof typeof STATUS_CONFIG]?.icon;
                  
                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-border hover:bg-surface-hover transition-colors cursor-pointer"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <td className="py-3 px-4 font-medium text-foreground">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                          {Icon && <Icon size={12} />}
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted max-w-md truncate">
                        {record.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {record.marked_by_name || 'System'}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {paginatedRecords.map((record, index) => {
              const badge = getStatusBadge(record.status);
              const Icon = STATUS_CONFIG[record.status as keyof typeof STATUS_CONFIG]?.icon;
              
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{formatDate(record.date)}</p>
                      <p className="text-xs text-muted mt-0.5">
                        by {record.marked_by_name || 'System'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                      {Icon && <Icon size={12} />}
                      {badge.label}
                    </span>
                  </div>
                  {record.notes && (
                    <div className="text-sm text-muted border-t border-border pt-2 mt-2">
                      <span className="font-medium">Notes:</span> {record.notes}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary px-3 py-2 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary px-3 py-2 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredRecords.length === 0 && (
            <div className="card p-12 text-center">
              <Calendar className="h-12 w-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Records Found</h3>
              <p className="text-muted">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No attendance records match your filters.'
                  : "You don't have any attendance records yet."}
              </p>
            </div>
          )}
        </>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && stats && (
        <div className="space-y-6">
          {/* Trend Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Attendance Trend Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.chartData}>
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
          </div>

          {/* Monthly Summary */}
          {monthlySummary && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CalendarDays size={20} />
                {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })} Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <div className="text-2xl font-bold text-success-600">{monthlySummary.present || 0}</div>
                  <div className="text-xs text-muted">Present</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <div className="text-2xl font-bold text-error-600">{monthlySummary.absent || 0}</div>
                  <div className="text-xs text-muted">Absent</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                  <div className="text-2xl font-bold text-warning-600">{monthlySummary.late || 0}</div>
                  <div className="text-xs text-muted">Late</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{monthlySummary.excused || 0}</div>
                  <div className="text-xs text-muted">Excused</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <div className="text-2xl font-bold text-accent-600">{monthlySummary.sick || 0}</div>
                  <div className="text-xs text-muted">Sick</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics View */}
      {viewMode === 'stats' && stats && (
        <div className="space-y-6">
          {/* Pie Chart */}
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
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Breakdown */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Monthly Breakdown
            </h3>
            <div className="space-y-4">
              {stats.chartData.slice().reverse().map((month: any) => {
                const rate = (month.present / month.total) * 100;
                return (
                  <div key={month.month}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-foreground">
                        {new Date(month.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <span className={`text-sm font-semibold ${
                        rate >= 90 ? 'text-success-600' : rate >= 75 ? 'text-warning-600' : 'text-error-600'
                      }`}>
                        {rate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${
                          rate >= 90 ? 'bg-success-500' : rate >= 75 ? 'bg-warning-500' : 'bg-error-500'
                        }`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted">
                      <span>✅ {month.present}</span>
                      <span>❌ {month.absent}</span>
                      <span>⏰ {month.late}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Record Detail Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedRecord(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface rounded-xl shadow-xl z-50"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">Attendance Details</h3>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted">Date</span>
                    <span className="font-medium text-foreground">{formatDate(selectedRecord.date)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted">Status</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusBadge(selectedRecord.status).color
                    }`}>
                      {getStatusBadge(selectedRecord.status).label}
                    </span>
                  </div>
                  {selectedRecord.notes && (
                    <div className="py-2 border-b border-border">
                      <span className="text-muted block mb-1">Notes</span>
                      <p className="text-foreground">{selectedRecord.notes}</p>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-muted">Marked By</span>
                    <span className="text-foreground">{selectedRecord.marked_by_name || 'System'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentAttendance;