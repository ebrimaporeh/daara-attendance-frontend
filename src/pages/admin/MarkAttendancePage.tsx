import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  X
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useAttendance } from '@/hooks/useAttendance';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Pagination } from '@/components/common/Pagination';

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
  const { bulkCreateAttendance } = useAttendance();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | 'all'>('all');
  const [studentsAttendance, setStudentsAttendance] = useState<StudentAttendance[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Debounce search input - only search after 3 characters
  useEffect(() => {
    // Don't trigger search if input is cleared
    if (searchInput === '') {
      setDebouncedSearch('');
      return;
    }
    
    // Only trigger search after 3 or more characters
    if (searchInput.length >= 3) {
      const timer = setTimeout(() => {
        setDebouncedSearch(searchInput);
      }, 500); // 500ms debounce delay
      
      return () => clearTimeout(timer);
    } else {
      // Clear search if less than 3 characters
      setDebouncedSearch('');
    }
  }, [searchInput]);

  // Fetch students with pagination and debounced search
  const { 
    data: studentsData, 
    isLoading: studentsLoading,
    refetch: refetchStudents
  } = useGetStudents({
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch || undefined,
  });

  // Get students and pagination from response
  const students = studentsData?.data || [];
  const pagination = studentsData?.pagination;

  // Initialize attendance records for students when data changes
  useEffect(() => {
    if (students && students.length > 0) {
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

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Filter students locally by status (since status is client-side only)
  const filteredByStatus = useMemo(() => {
    if (selectedStatus === 'all') return studentsAttendance;
    return studentsAttendance.filter(s => s.status === selectedStatus);
  }, [studentsAttendance, selectedStatus]);

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
    toast.success(`All students on current page marked as ${STATUS_CONFIG[status].label}`);
    setShowBulkActions(false);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    
    try {
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setDebouncedSearch('');
  };

  // Show loading indicator only on initial load or when searching with 3+ characters
  const showLoading = studentsLoading && !students.length;

  // Get search status message
  const getSearchStatusMessage = () => {
    if (searchInput.length > 0 && searchInput.length < 3) {
      return "Type at least 3 characters to search";
    }
    if (debouncedSearch && students.length === 0 && !studentsLoading) {
      return `No students found matching "${debouncedSearch}"`;
    }
    return null;
  };

  const searchStatusMessage = getSearchStatusMessage();

  if (showLoading) {
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
              >
                <Filter size={18} />
                <span className="text-sm font-medium">Bulk Actions</span>
                <ChevronDown size={16} className={`transition-transform ${showBulkActions ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AttendanceStatus | 'all')}
                className="input text-sm w-auto"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
                <option value="sick">Sick</option>
              </select>
            </div>
            
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Type at least 3 characters to search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input pl-9 pr-8 text-sm w-full"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <div className="text-sm text-muted">
              Showing {students.length} students
              {pagination && ` of ${pagination.total_items}`}
            </div>
          </div>
          
          {/* Search status message */}
          {searchStatusMessage && (
            <div className="mt-2 text-xs text-muted italic">
              {searchStatusMessage}
            </div>
          )}
          
          <AnimatePresence>
            {showBulkActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-border"
              >
                <div className="text-sm text-muted mb-2">Mark all students on current page as:</div>
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
        {filteredByStatus.map((student, index) => {
          const config = STATUS_CONFIG[student.status];
          const Icon = config.icon;
          
          return (
            <motion.div
              key={student.studentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
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

      {/* Empty State */}
      {filteredByStatus.length === 0 && (
        <div className="card p-12 text-center">
          <Users className="h-12 w-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Students Found</h3>
          <p className="text-muted">
            {searchInput.length > 0 && searchInput.length < 3
              ? 'Please type at least 3 characters to search for students.'
              : searchInput.length >= 3
                ? `No students found matching "${searchInput}". Try a different search term.`
                : selectedStatus !== 'all'
                  ? `No students with status "${STATUS_CONFIG[selectedStatus].label}" found.`
                  : 'No students available to mark attendance.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="mt-6 pt-4 border-t border-border">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total_items}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            showPageSizeSelector={true}
            pageSizeOptions={[10, 20, 30, 50]}
          />
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