import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  FileText,
  PieChart
} from 'lucide-react';
import { useAttendance } from '@/hooks/useAttendance';
import { useUsers } from '@/hooks/useUsers';
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
  Cell
} from 'recharts';

const STATUS_ICONS = {
  present: CheckCircle,
  absent: XCircle,
  late: Clock,
  excused: AlertCircle,
  sick: Heart
};

const STATUS_COLORS = {
  present: '#10b981',
  absent: '#ef4444',
  late: '#f59e0b',
  excused: '#3b82f6',
  sick: '#8b5cf6'
};

const AdminAttendancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { useGetAttendance, deleteAttendance, useGetAttendanceSummary } = useAttendance();
  const { useGetStudents } = useUsers();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  
  const itemsPerPage = 15;

  const { data: attendanceRecords, isLoading: attendanceLoading, refetch } = useGetAttendance();
  const { data: dailySummary } = useGetAttendanceSummary({ date: selectedDate });

  const deleteMutation = useMutation({
    mutationFn: deleteAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance record deleted successfully');
      setShowDeleteModal(false);
      setRecordToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete attendance record');
    },
  });

  // Filter and search records
  const filteredRecords = useMemo(() => {
    if (!attendanceRecords) return [];
    
    let records = [...attendanceRecords];
    
    // Filter by date
    if (selectedDate) {
      records = records.filter(r => r.date === selectedDate);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      records = records.filter(r => r.status === statusFilter);
    }
    
    // Search by student name
    if (searchQuery) {
      records = records.filter(r => 
        r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.student_phone.includes(searchQuery)
      );
    }
    
    return records.sort((a, b) => a.student_name.localeCompare(b.student_name));
  }, [attendanceRecords, selectedDate, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!dailySummary) return [];
    return [
      { name: 'Present', value: dailySummary.present, color: STATUS_COLORS.present },
      { name: 'Absent', value: dailySummary.absent, color: STATUS_COLORS.absent },
      { name: 'Late', value: dailySummary.late, color: STATUS_COLORS.late },
      { name: 'Excused', value: dailySummary.excused, color: STATUS_COLORS.excused },
      { name: 'Sick', value: dailySummary.sick, color: STATUS_COLORS.sick },
    ].filter(item => item.value > 0);
  }, [dailySummary]);

  const weeklyTrendData = [
    { day: 'Mon', present: 85, absent: 10, late: 5 },
    { day: 'Tue', present: 88, absent: 8, late: 4 },
    { day: 'Wed', present: 92, absent: 5, late: 3 },
    { day: 'Thu', present: 90, absent: 7, late: 3 },
    { day: 'Fri', present: 87, absent: 9, late: 4 },
  ];

  const handleDelete = async () => {
    if (recordToDelete) {
      await deleteMutation.mutateAsync(recordToDelete);
    }
  };

  const exportToCSV = () => {
    const headers = ['Student Name', 'Phone', 'Date', 'Status', 'Notes', 'Marked By'];
    const csvData = filteredRecords.map(record => [
      record.student_name,
      record.student_phone,
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
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (attendanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Attendance Records</h1>
          <p className="text-muted text-sm mt-1">View and manage student attendance</p>
        </div>
        
        <div className="flex gap-2">
          <Link
            to="/admin/attendance/mark"
            className="btn btn-primary flex items-center gap-2"
          >
            <Calendar size={18} />
            <span>Mark Attendance</span>
          </Link>
          <button
            onClick={exportToCSV}
            className="btn btn-secondary flex items-center gap-2"
            disabled={filteredRecords.length === 0}
          >
            <Download size={18} />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Date Selection & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <label className="label flex items-center gap-2">
            <Calendar size={18} />
            <span>Select Date</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div className="card p-4">
          <label className="label flex items-center gap-2">
            <CalendarDays size={18} />
            <span>Monthly View</span>
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input"
          />
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} />
              <span className="font-medium text-foreground">Attendance Rate</span>
            </div>
            <span className="text-2xl font-bold text-primary-600">
              {dailySummary?.attendance_rate || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${dailySummary?.attendance_rate || 0}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-2">
            {dailySummary?.present || 0} out of {dailySummary?.total || 0} students present
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(STATUS_COLORS).map(([status, color]) => {
          const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS];
          const count = dailySummary?.[status as keyof typeof dailySummary] || 0;
          const percentage = dailySummary?.total ? ((count / dailySummary.total) * 100).toFixed(1) : 0;
          
          return (
            <motion.div
              key={status}
              whileHover={{ scale: 1.02 }}
              className="card p-3 cursor-pointer"
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} style={{ color }} />
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full`}
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {percentage}%
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">{count}</div>
              <div className="text-xs text-muted capitalize">{status}</div>
            </motion.div>
          );
        })}
      </div>

      {/* View Toggle & Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search by student name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
              <option value="sick">Sick</option>
            </select>
            
            {/* View Mode Toggle */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-surface text-muted hover:text-foreground'
                }`}
              >
                <FileText size={18} />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-surface text-muted hover:text-foreground'
                }`}
              >
                <Calendar size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <PieChart size={20} />
              Daily Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Trend */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Weekly Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Records List */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-muted font-medium">Student</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Notes</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Marked By</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((record) => {
                  const badge = getStatusBadge(record.status);
                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-border hover:bg-surface-hover transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-foreground">{record.student_name}</td>
                      <td className="py-3 px-4 text-muted">{record.student_phone}</td>
                      <td className="py-3 px-4 text-muted">{formatDate(record.date)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted max-w-xs truncate">{record.notes || '-'}</td>
                      <td className="py-3 px-4 text-muted">{record.marked_by_name || 'System'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/attendance/${record.id}/edit`}
                            className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => {
                              setRecordToDelete(record.id);
                              setShowDeleteModal(true);
                            }}
                            className="p-1 text-error-600 hover:bg-error-50 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {paginatedRecords.map((record) => {
              const badge = getStatusBadge(record.status);
              const Icon = STATUS_ICONS[record.status as keyof typeof STATUS_ICONS];
              
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{record.student_name}</h3>
                      <p className="text-xs text-muted mt-0.5">{record.student_phone}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                      <Icon size={12} />
                      {badge.label}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Date:</span>
                      <span className="text-foreground">{formatDate(record.date)}</span>
                    </div>
                    {record.notes && (
                      <div className="flex justify-between">
                        <span className="text-muted">Notes:</span>
                        <span className="text-foreground text-right flex-1 ml-2">{record.notes}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted">Marked by:</span>
                      <span className="text-foreground">{record.marked_by_name || 'System'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Link
                      to={`/admin/attendance/${record.id}/edit`}
                      className="flex-1 btn btn-secondary flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit size={16} />
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        setRecordToDelete(record.id);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 btn btn-danger flex items-center justify-center gap-2 text-sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
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
              <p className="text-muted mb-4">
                No attendance records found for the selected date and filters.
              </p>
              <Link to="/admin/attendance/mark" className="btn btn-primary">
                Mark Attendance
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
                <h3 className="text-lg font-semibold text-foreground mb-2">Delete Record</h3>
                <p className="text-muted text-sm">
                  Are you sure you want to delete this attendance record? This action cannot be undone.
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
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 btn btn-danger"
                >
                  {deleteMutation.isPending ? (
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

export default AdminAttendancePage;