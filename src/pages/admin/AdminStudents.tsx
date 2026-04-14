import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Download,
  Upload,
  Mail,
  Phone,
  Calendar,
  Shield,
  MoreVertical,
  Eye,
  UserCheck,
  UserX,
  RefreshCw,
  GraduationCap,
  Activity,
  Award,
  Clock,
  X,
  Check,
  AlertCircle,
  FileText,
  PieChart,
  TrendingUp,
  Star
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useAttendance } from '@/hooks/useAttendance';
import { registerSchema } from '@/utils/validation';
import { formatDate, getStatusBadge } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import * as z from 'zod';

type Student = {
  id: number;
  first_name: string;
  last_name: string;
  fathers_first_name: string;
  phone: string;
  user_type: 'student' | 'admin';
  email?: string;
  date_joined?: string;
  last_login?: string;
  is_active?: boolean;
  is_staff?: boolean;
};

type StudentFormData = {
  first_name: string;
  last_name: string;
  fathers_first_name: string;
  phone: string;
  email?: string;
  password: string;
  confirm_password: string;
};

const studentFormSchema = registerSchema.extend({
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

const AdminStudentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { useGetStudents, changeUserRole } = useUsers();
  const { useGetStudentAttendance, useGetAttendanceSummary } = useAttendance();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'attendance'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  
  const itemsPerPage = 12;

  const { data: students, isLoading: studentsLoading, refetch } = useGetStudents();
  const { data: monthlySummary } = useGetAttendanceSummary({ 
    month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` 
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, userType }: { id: number; userType: 'student' | 'admin' }) =>
      changeUserRole({ id, userType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Student status updated successfully');
    },
  });

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    
    let filtered = [...students];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(s => 
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        s.fathers_first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => 
        statusFilter === 'active' ? s.is_active !== false : s.is_active === false
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      } else if (sortBy === 'date') {
        return new Date(b.date_joined || 0).getTime() - new Date(a.date_joined || 0).getTime();
      }
      return 0;
    });
    
    return filtered;
  }, [students, searchQuery, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteStudent = async () => {
    // API call would go here
    toast.success(`Student ${studentToDelete?.first_name} ${studentToDelete?.last_name} deleted`);
    setShowDeleteModal(false);
    setStudentToDelete(null);
    refetch();
  };

  const handleBulkDelete = () => {
    toast.success(`${selectedStudents.length} students deleted`);
    setSelectedStudents([]);
    setShowBulkModal(false);
    refetch();
  };

  const handleBulkExport = () => {
    const selectedData = students?.filter(s => selectedStudents.includes(s.id));
    const headers = ['Name', 'Father\'s Name', 'Phone', 'Email', 'Join Date', 'Status'];
    const csvData = selectedData?.map(student => [
      `${student.first_name} ${student.last_name}`,
      student.fathers_first_name,
      student.phone,
      student.email || '',
      formatDate(student.date_joined || new Date().toISOString()),
      student.is_active !== false ? 'Active' : 'Inactive'
    ]) || [];
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${selectedStudents.length} students exported`);
    setSelectedStudents([]);
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedStudents.map(s => s.id));
    }
  };

  const getAttendanceStats = (studentId: number) => {
    // This would calculate from actual API data
    return {
      present: 85,
      absent: 10,
      late: 5,
      attendanceRate: 85,
      streak: 5,
      lastAttendance: '2026-04-13'
    };
  };

  if (studentsLoading) {
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted text-sm mt-1">Manage all enrolled students and their progress</p>
        </div>
        
        <div className="flex gap-2">
          {selectedStudents.length > 0 && (
            <>
              <button
                onClick={handleBulkExport}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download size={18} />
                <span className="hidden md:inline">Export ({selectedStudents.length})</span>
              </button>
              <button
                onClick={() => setShowBulkModal(true)}
                className="btn btn-danger flex items-center gap-2"
              >
                <Trash2 size={18} />
                <span className="hidden md:inline">Delete ({selectedStudents.length})</span>
              </button>
            </>
          )}
          <button
            onClick={() => {
              setIsEditing(false);
              setShowStudentModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <UserPlus size={18} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Total Students</p>
              <p className="text-2xl font-bold text-foreground">{students?.length || 0}</p>
              <p className="text-xs text-success-600 mt-1">+12 this month</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-950/30 p-3 rounded-full">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Active Students</p>
              <p className="text-2xl font-bold text-foreground">
                {students?.filter(s => s.is_active !== false).length || 0}
              </p>
              <p className="text-xs text-success-600 mt-1">95% of total</p>
            </div>
            <div className="bg-success-100 dark:bg-success-950/30 p-3 rounded-full">
              <UserCheck className="h-5 w-5 text-success-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Avg Attendance</p>
              <p className="text-2xl font-bold text-foreground">
                {monthlySummary?.attendance_rate || 87}%
              </p>
              <p className="text-xs text-success-600 mt-1">↑ 5% from last month</p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-950/30 p-3 rounded-full">
              <TrendingUp className="h-5 w-5 text-warning-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Top Performers</p>
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-xs text-primary-600 mt-1">95%+ attendance</p>
            </div>
            <div className="bg-accent-100 dark:bg-accent-950/30 p-3 rounded-full">
              <Star className="h-5 w-5 text-accent-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name, phone, father's name, or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input"
            >
              <option value="all">All Students</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input"
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Join Date</option>
              <option value="attendance">Sort by Attendance</option>
            </select>
            
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-surface text-muted hover:text-foreground'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-surface text-muted hover:text-foreground'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Bulk selection indicator */}
        {selectedStudents.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted">
              {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedStudents([])}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Students Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedStudents.map((student, index) => {
            const stats = getAttendanceStats(student.id);
            const isSelected = selectedStudents.includes(student.id);
            
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card overflow-hidden hover:shadow-lg transition-all group ${
                  isSelected ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {/* Checkbox for bulk selection */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleStudentSelection(student.id)}
                    className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                  />
                </div>
                
                <div className="p-5 pt-12">
                  {/* Avatar & Name */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {student.first_name[0]}{student.last_name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {student.first_name} {student.last_name}
                        </h3>
                        <p className="text-xs text-muted">d/o {student.fathers_first_name}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowAttendanceModal(true);
                        }}
                        className="p-1.5 rounded-lg text-muted hover:bg-surface-hover transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-muted flex-shrink-0" />
                      <span className="text-foreground text-sm">{student.phone}</span>
                    </div>
                    {student.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-muted flex-shrink-0" />
                        <span className="text-foreground text-sm truncate">{student.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-muted flex-shrink-0" />
                      <span className="text-foreground text-sm">
                        Joined {formatDate(student.date_joined || new Date().toISOString())}
                      </span>
                    </div>
                  </div>
                  
                  {/* Attendance Stats */}
                  <div className="bg-surface rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted">Attendance Rate</span>
                      <span className="text-sm font-semibold text-primary-600">
                        {stats.attendanceRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                      <div 
                        className="bg-primary-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${stats.attendanceRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted">
                      <span>✅ {stats.present}</span>
                      <span>❌ {stats.absent}</span>
                      <span>⏰ {stats.late}</span>
                    </div>
                    {stats.streak > 0 && (
                      <div className="mt-2 text-xs text-success-600 flex items-center gap-1">
                        <Award size={12} />
                        {stats.streak} day streak!
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/students/${student.id}`}
                      className="flex-1 btn btn-secondary flex items-center justify-center gap-1 text-sm"
                    >
                      <Eye size={14} />
                      View
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsEditing(true);
                        setShowStudentModal(true);
                      }}
                      className="btn btn-secondary p-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setStudentToDelete(student);
                        setShowDeleteModal(true);
                      }}
                      className="btn btn-danger p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Students List View - Desktop */}
      {viewMode === 'list' && (
        <div className="hidden md:block overflow-x-auto">
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="py-3 px-4 w-8">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                      onChange={toggleAllSelection}
                      className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Student</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Father's Name</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Join Date</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Attendance</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => {
                  const stats = getAttendanceStats(student.id);
                  const isSelected = selectedStudents.includes(student.id);
                  
                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b border-border hover:bg-surface-hover transition-colors ${
                        isSelected ? 'bg-primary-50 dark:bg-primary-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 text-xs font-bold">
                              {student.first_name[0]}{student.last_name[0]}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">
                            {student.first_name} {student.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">{student.fathers_first_name}</td>
                      <td className="py-3 px-4 text-muted">{student.phone}</td>
                      <td className="py-3 px-4 text-muted text-sm">
                        {formatDate(student.date_joined || new Date().toISOString())}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-primary-600 h-1.5 rounded-full"
                              style={{ width: `${stats.attendanceRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted">{stats.attendanceRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          student.is_active !== false 
                            ? 'bg-success-100 text-success-800 dark:bg-success-950/30 dark:text-success-300'
                            : 'bg-error-100 text-error-800 dark:bg-error-950/30 dark:text-error-300'
                        }`}>
                          {student.is_active !== false ? <UserCheck size={12} /> : <UserX size={12} />}
                          {student.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/students/${student.id}`}
                            className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsEditing(true);
                              setShowStudentModal(true);
                            }}
                            className="p-1 text-warning-600 hover:bg-warning-50 rounded transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setStudentToDelete(student);
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
        </div>
      )}

      {/* Mobile List View */}
      {viewMode === 'list' && (
        <div className="md:hidden space-y-3">
          {paginatedStudents.map((student) => {
            const stats = getAttendanceStats(student.id);
            const isSelected = selectedStudents.includes(student.id);
            
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card p-4 ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                    />
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-sm">
                        {student.first_name[0]}{student.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {student.first_name} {student.last_name}
                      </h3>
                      <p className="text-xs text-muted">d/o {student.fathers_first_name}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    student.is_active !== false 
                      ? 'bg-success-100 text-success-800'
                      : 'bg-error-100 text-error-800'
                  }`}>
                    {student.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm mb-3 ml-7">
                  <div className="flex justify-between">
                    <span className="text-muted">Phone:</span>
                    <span className="text-foreground">{student.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Attendance:</span>
                    <span className="text-foreground font-medium">{stats.attendanceRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Joined:</span>
                    <span className="text-foreground">
                      {formatDate(student.date_joined || new Date().toISOString())}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-7">
                  <Link
                    to={`/admin/students/${student.id}`}
                    className="flex-1 btn btn-secondary flex items-center justify-center gap-1 text-sm"
                  >
                    <Eye size={14} />
                    View
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsEditing(true);
                      setShowStudentModal(true);
                    }}
                    className="flex-1 btn btn-secondary flex items-center justify-center gap-1 text-sm"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'text-muted hover:bg-surface-hover'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
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
      {filteredStudents.length === 0 && (
        <div className="card p-12 text-center">
          <Users className="h-12 w-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Students Found</h3>
          <p className="text-muted mb-4">
            {searchQuery ? 'No students match your search criteria.' : 'Start by adding your first student.'}
          </p>
          {!searchQuery && (
            <button onClick={() => setShowStudentModal(true)} className="btn btn-primary">
              <UserPlus size={18} className="mr-2" />
              Add Student
            </button>
          )}
        </div>
      )}

      {/* Student Modal (Add/Edit) */}
      <AnimatePresence>
        {showStudentModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowStudentModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface rounded-xl shadow-xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  {isEditing ? 'Edit Student' : 'Add New Student'}
                </h2>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter first name"
                    defaultValue={isEditing ? selectedStudent?.first_name : ''}
                  />
                </div>
                
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter last name"
                    defaultValue={isEditing ? selectedStudent?.last_name : ''}
                  />
                </div>
                
                <div>
                  <label className="label">Father's Name *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter father's name"
                    defaultValue={isEditing ? selectedStudent?.fathers_first_name : ''}
                  />
                </div>
                
                <div>
                  <label className="label">Phone Number *</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="7123456"
                    defaultValue={isEditing ? selectedStudent?.phone : ''}
                  />
                  <p className="text-xs text-muted mt-1">7 digits starting with 2,4,5,6,7,9</p>
                </div>
                
                <div>
                  <label className="label">Email (Optional)</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="student@example.com"
                    defaultValue={isEditing ? selectedStudent?.email : ''}
                  />
                </div>
                
                {!isEditing && (
                  <>
                    <div>
                      <label className="label">Password *</label>
                      <input
                        type="password"
                        className="input"
                        placeholder="Create password"
                      />
                    </div>
                    
                    <div>
                      <label className="label">Confirm Password *</label>
                      <input
                        type="password"
                        className="input"
                        placeholder="Confirm password"
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="sticky bottom-0 bg-surface border-t border-border p-4 flex gap-3">
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success(isEditing ? 'Student updated' : 'Student added');
                    setShowStudentModal(false);
                    refetch();
                  }}
                  className="flex-1 btn btn-primary"
                >
                  {isEditing ? 'Update' : 'Add'} Student
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Attendance Modal */}
      <AnimatePresence>
        {showAttendanceModal && selectedStudent && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAttendanceModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface rounded-xl shadow-xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Attendance Details</h2>
                  <p className="text-sm text-muted">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                </div>
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary-600 mb-2">87%</div>
                  <p className="text-muted">Overall Attendance Rate</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-success-600">
                      <TrendingUp size={12} />
                      ↑ 5% from last month
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 bg-success-50 dark:bg-success-950/30 rounded-lg">
                    <div className="text-2xl font-bold text-success-600">85</div>
                    <div className="text-xs text-muted">Present</div>
                  </div>
                  <div className="text-center p-3 bg-error-50 dark:bg-error-950/30 rounded-lg">
                    <div className="text-2xl font-bold text-error-600">10</div>
                    <div className="text-xs text-muted">Absent</div>
                  </div>
                  <div className="text-center p-3 bg-warning-50 dark:bg-warning-950/30 rounded-lg">
                    <div className="text-2xl font-bold text-warning-600">5</div>
                    <div className="text-xs text-muted">Late</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Award size={16} />
                    Current Streak
                  </h3>
                  <div className="bg-surface-hover rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary-600">5 days</div>
                    <p className="text-xs text-muted">Last attendance: April 13, 2026</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    Recent Activity
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {[
                      { date: '2026-04-13', status: 'present' },
                      { date: '2026-04-12', status: 'present' },
                      { date: '2026-04-11', status: 'late' },
                      { date: '2026-04-10', status: 'present' },
                      { date: '2026-04-09', status: 'absent' },
                    ].map((record, idx) => {
                      const badge = getStatusBadge(record.status);
                      return (
                        <div key={idx} className="flex justify-between items-center p-2 bg-surface-hover rounded-lg">
                          <span className="text-sm">{formatDate(record.date)}</span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowBulkModal(false)} />
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
                <h3 className="text-lg font-semibold text-foreground mb-2">Delete Multiple Students</h3>
                <p className="text-muted text-sm">
                  Are you sure you want to delete {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}? 
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 btn btn-danger"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Single Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && studentToDelete && (
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
                  Are you sure you want to delete {studentToDelete.first_name} {studentToDelete.last_name}? 
                  This action cannot be undone.
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
                  onClick={handleDeleteStudent}
                  className="flex-1 btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStudentsPage;