import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Heart,
  AlertCircle,
  Users,
  Calendar,
  ChevronDown,
  Check,
  Save,
  RefreshCw,
  UserCheck,
  UserX,
  Clock as ClockIcon,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useAttendance } from '@/hooks/useAttendance';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'sick';

interface StudentAttendance {
  studentId: number;
  studentName: string;
  studentPhone: string;
  status: AttendanceStatus;
  notes?: string;
  isChanged?: boolean;
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  present: {
    label: 'Present',
    color: 'text-success-600',
    bgColor: 'bg-success-50 dark:bg-success-950/30 border-success-200',
    icon: CheckCircle
  },
  absent: {
    label: 'Absent',
    color: 'text-error-600',
    bgColor: 'bg-error-50 dark:bg-error-950/30 border-error-200',
    icon: XCircle
  },
  late: {
    label: 'Late',
    color: 'text-warning-600',
    bgColor: 'bg-warning-50 dark:bg-warning-950/30 border-warning-200',
    icon: Clock
  },
  excused: {
    label: 'Excused',
    color: 'text-primary-600',
    bgColor: 'bg-primary-50 dark:bg-primary-950/30 border-primary-200',
    icon: AlertCircle
  },
  sick: {
    label: 'Sick',
    color: 'text-accent-600',
    bgColor: 'bg-accent-50 dark:bg-accent-950/30 border-accent-200',
    icon: Heart
  }
};

const MarkAttendance: React.FC = () => {
  const queryClient = useQueryClient();
  const { useGetStudents } = useUsers();
  const { createAttendance, bulkCreateAttendance } = useAttendance();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | 'all'>('all');
  const [studentsAttendance, setStudentsAttendance] = useState<StudentAttendance[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: students, isLoading: studentsLoading } = useGetStudents();

  // Initialize attendance records for students
  useEffect(() => {
    if (students) {
      setStudentsAttendance(
        students.map(student => ({
          studentId: student.id,
          studentName: `${student.first_name} ${student.last_name}`,
          studentPhone: student.phone,
          status: 'present',
          notes: '',
          isChanged: false
        }))
      );
    }
  }, [students]);

  // Filter students based on search and status filter
  const filteredStudents = useMemo(() => {
    let filtered = studentsAttendance;
    
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentPhone.includes(searchQuery)
      );
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(s => s.status === selectedStatus);
    }
    
    return filtered;
  }, [studentsAttendance, searchQuery, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const updateStudentStatus = (studentId: number, status: AttendanceStatus) => {
    setStudentsAttendance(prev =>
      prev.map(s =>
        s.studentId === studentId
          ? { ...s, status, isChanged: true }
          : s
      )
    );
  };

  const bulkUpdateStatus = (status: AttendanceStatus) => {
    setStudentsAttendance(prev =>
      prev.map(s => ({ ...s, status, isChanged: true }))
    );
    toast.success(`All students marked as ${STATUS_CONFIG[status].label}`);
    setShowBulkActions(false);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    
    // Group records by status for bulk creation
    const recordsByStatus: Record<AttendanceStatus, number[]> = {
      present: [],
      absent: [],
      late: [],
      excused: [],
      sick: []
    };
    
    studentsAttendance.forEach(student => {
      recordsByStatus[student.status].push(student.studentId);
    });
    
    const promises = [];
    
    // Create bulk records for each status
    for (const [status, studentIds] of Object.entries(recordsByStatus)) {
      if (studentIds.length > 0) {
        const records = studentIds.map(studentId => ({
          student: studentId,
          status,
          date: selectedDate,
          notes: `${STATUS_CONFIG[status as AttendanceStatus].label} - Marked via bulk attendance`
        }));
        
        promises.push(bulkCreateAttendance({ records, date: selectedDate }));
      }
    }
    
    try {
      await Promise.all(promises);
      toast.success(`Attendance saved for ${studentsAttendance.length} students`);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setStudentsAttendance(prev => prev.map(s => ({ ...s, isChanged: false })));
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      sick: 0
    };
    
    studentsAttendance.forEach(s => {
      stats[s.status]++;
    });
    
    return stats;
  };

  const statusStats = getStatusStats();

  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mark Attendance</h1>
          <p className="text-muted text-sm mt-1">Record attendance for all students</p>
        </div>
        
        <button
          onClick={handleSaveAttendance}
          disabled={isSaving}
          className="btn btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
        >
          {isSaving ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
        </button>
      </div>

      {/* Date Picker & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} />
            <span className="font-medium text-foreground">Today's Summary</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            <div className="bg-success-50 dark:bg-success-950/30 rounded-lg p-2">
              <div className="text-success-600 font-bold">{statusStats.present}</div>
              <div className="text-xs text-muted">Present</div>
            </div>
            <div className="bg-error-50 dark:bg-error-950/30 rounded-lg p-2">
              <div className="text-error-600 font-bold">{statusStats.absent}</div>
              <div className="text-xs text-muted">Absent</div>
            </div>
            <div className="bg-warning-50 dark:bg-warning-950/30 rounded-lg p-2">
              <div className="text-warning-600 font-bold">{statusStats.late}</div>
              <div className="text-xs text-muted">Late</div>
            </div>
            <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-2">
              <div className="text-primary-600 font-bold">{statusStats.excused}</div>
              <div className="text-xs text-muted">Excused</div>
            </div>
            <div className="bg-accent-50 dark:bg-accent-950/30 rounded-lg p-2">
              <div className="text-accent-600 font-bold">{statusStats.sick}</div>
              <div className="text-xs text-muted">Sick</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="relative">
        <div className="card p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-600"
              >
                <Filter size={18} />
                <span className="text-sm font-medium">Bulk Actions</span>
                <ChevronDown size={16} className={`transition-transform ${showBulkActions ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 text-sm"
                />
              </div>
            </div>
            
            <div className="text-sm text-muted">
              {filteredStudents.length} / {studentsAttendance.length} students
            </div>
          </div>
          
          <AnimatePresence>
            {showBulkActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-border"
              >
                <div className="text-sm text-muted mb-2">Mark all students as:</div>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => bulkUpdateStatus(status as AttendanceStatus)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all active:scale-95 ${config.bgColor}`}
                    >
                      <config.icon size={18} className={config.color} />
                      <span className={`text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {paginatedStudents.map((student, index) => {
          const config = STATUS_CONFIG[student.status];
          const Icon = config.icon;
          
          return (
            <motion.div
              key={student.studentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
              className={`card p-4 transition-all ${student.isChanged ? 'ring-2 ring-primary-500' : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {student.studentName}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {student.studentPhone}
                  </p>
                </div>
                
                {/* Status Selector */}
                <div className="relative">
                  <select
                    value={student.status}
                    onChange={(e) => updateStudentStatus(student.studentId, e.target.value as AttendanceStatus)}
                    className="appearance-none bg-transparent pl-8 pr-6 py-2 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                    style={{ color: config.color.replace('text-', '') }}
                  >
                    {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                      <option key={status} value={status} className="text-foreground">
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                  <Icon 
                    size={16} 
                    className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${config.color}`}
                  />
                  <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted" />
                </div>
              </div>
              
              {/* Quick status indicator */}
              <div className={`mt-2 h-1 rounded-full ${config.color.replace('text', 'bg')}`} />
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
          
          <div className="flex items-center gap-1 overflow-x-auto">
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

      {/* Floating Save Button for Mobile */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
        <button
          onClick={handleSaveAttendance}
          disabled={isSaving}
          className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 shadow-lg"
        >
          {isSaving ? (
            <RefreshCw size={20} className="animate-spin" />
          ) : (
            <Save size={20} />
          )}
          <span className="font-semibold">Save Attendance ({studentsAttendance.length} students)</span>
        </button>
      </div>
    </div>
  );
};

export default MarkAttendance;