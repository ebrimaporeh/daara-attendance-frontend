// src/pages/admin/MarkAttendance.tsx
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, CheckCircle, XCircle, Clock, Heart, AlertCircle,
  Users, Calendar, ChevronDown, RefreshCw, X, Loader2,
  Lock, Filter, ChevronLeft, ChevronRight, BookOpen, Minus
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useAttendance } from '@/hooks/useAttendance';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'sick' | 'unmarked';

interface StudentRow {
  student_id: number;
  student_name: string;
  student_phone: string;
  record_id: number | null;
  status: AttendanceStatus;
  notes: string;
  marked_by_name: string | null;
  marked_at: string | null;
}

type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SyncState {
  [studentId: number]: { status: SyncStatus; errorMessage?: string };
}

// ---------------------------------------------------------------------------
// Status config — covers all 6 states
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<AttendanceStatus, {
  label: string;
  shortLabel: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  icon: React.ElementType;
}> = {
  unmarked: {
    label: 'Unmarked',
    shortLabel: '—',
    textColor: 'text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-300',
    icon: Minus,
  },
  present: {
    label: 'Present',
    shortLabel: 'P',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
    icon: CheckCircle,
  },
  absent: {
    label: 'Absent',
    shortLabel: 'A',
    textColor: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-200 dark:border-red-800',
    dotColor: 'bg-red-500',
    icon: XCircle,
  },
  late: {
    label: 'Late',
    shortLabel: 'L',
    textColor: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800',
    dotColor: 'bg-amber-500',
    icon: Clock,
  },
  excused: {
    label: 'Excused',
    shortLabel: 'E',
    textColor: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800',
    dotColor: 'bg-blue-500',
    icon: AlertCircle,
  },
  sick: {
    label: 'Sick',
    shortLabel: 'S',
    textColor: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800',
    dotColor: 'bg-purple-500',
    icon: Heart,
  },
};

// Statuses teachers can set (not unmarked — that's the default state)
const MARKABLE_STATUSES: AttendanceStatus[] = ['present', 'late', 'excused', 'sick', 'absent'];

// ---------------------------------------------------------------------------
// Close Session Modal
// ---------------------------------------------------------------------------
const CloseSessionModal: React.FC<{
  summary: Record<string, number>;
  onConfirm: () => void;
  onCancel: () => void;
  isClosing: boolean;
}> = ({ summary, onConfirm, onCancel, isClosing }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">Close Attendance Session</h2>
            <p className="text-white/70 text-sm">All unmarked students will be set to Absent</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-5">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Current session status:
        </p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {(['present', 'late', 'excused', 'sick', 'absent', 'unmarked'] as AttendanceStatus[]).map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} className={`rounded-xl p-3 text-center ${cfg.bgColor} border ${cfg.borderColor}`}>
                <div className={`text-xl font-bold ${cfg.textColor}`}>{summary[s] ?? 0}</div>
                <div className={`text-xs mt-0.5 ${cfg.textColor} opacity-80`}>{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {(summary.unmarked ?? 0) > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
            <strong>{summary.unmarked}</strong> unmarked student{summary.unmarked !== 1 ? 's' : ''} will be marked <strong>Absent</strong>.
          </div>
        )}
        {(summary.unmarked ?? 0) === 0 && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm">
            All students have been marked. No changes will be made.
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-5 pt-0">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isClosing}
          className="flex-1 py-3 rounded-xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isClosing ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
          {isClosing ? 'Closing…' : 'Confirm & Close'}
        </button>
      </div>
    </motion.div>
  </div>
);

// ---------------------------------------------------------------------------
// Quick-status pill row (inline tap targets)
// ---------------------------------------------------------------------------
const StatusPills: React.FC<{
  current: AttendanceStatus;
  onChange: (s: AttendanceStatus) => void;
  disabled: boolean;
}> = ({ current, onChange, disabled }) => (
  <div className="flex gap-1.5 flex-wrap mt-2.5">
    {MARKABLE_STATUSES.map(s => {
      const cfg = STATUS_CONFIG[s];
      const active = current === s;
      return (
        <button
          key={s}
          disabled={disabled}
          onClick={() => !disabled && onChange(s)}
          className={`
            px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 select-none
            ${active
              ? `${cfg.bgColor} ${cfg.borderColor} ${cfg.textColor} shadow-sm`
              : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
            }
            disabled:opacity-40 disabled:cursor-not-allowed
            min-h-[32px] min-w-[44px] flex items-center justify-center
          `}
        >
          {cfg.label}
        </button>
      );
    })}
  </div>
);

// ---------------------------------------------------------------------------
// Student Card
// ---------------------------------------------------------------------------
const StudentCard: React.FC<{
  student: StudentRow;
  syncState?: { status: SyncStatus; errorMessage?: string };
  onStatusChange: (student: StudentRow, newStatus: AttendanceStatus) => void;
  index: number;
}> = ({ student, syncState, onStatusChange, index }) => {
  const cfg = STATUS_CONFIG[student.status];
  const Icon = cfg.icon;
  const isSaving = syncState?.status === 'saving';
  const isSaved = syncState?.status === 'saved';
  const isError = syncState?.status === 'error';
  const isUnmarked = student.status === 'unmarked';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.3), duration: 0.2 }}
      className={`
        rounded-2xl border p-4 transition-all duration-200
        ${isUnmarked
          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          : `${cfg.bgColor} ${cfg.borderColor}`
        }
        ${isSaving ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar / status indicator */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
          ${isUnmarked ? 'bg-slate-100 dark:bg-slate-800' : cfg.bgColor}
        `}>
          {isSaving
            ? <Loader2 size={18} className="animate-spin text-slate-400" />
            : isSaved
            ? <CheckCircle size={18} className="text-emerald-500" />
            : isError
            ? <XCircle size={18} className="text-red-500" />
            : <Icon size={18} className={isUnmarked ? 'text-slate-300 dark:text-slate-600' : cfg.textColor} />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm">
              {student.student_name}
            </span>
            {isUnmarked && (
              <span className="flex-shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5">
                Not marked
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{student.student_phone}</p>

          {/* Marked-by info */}
          {student.marked_by_name && !isUnmarked && (
            <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-1">
              by {student.marked_by_name}
              {student.marked_at && (
                <span> · {new Date(student.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </p>
          )}

          {/* Error */}
          {isError && (
            <p className="text-[11px] text-red-500 mt-1">{syncState?.errorMessage || 'Failed to save'}</p>
          )}

          {/* Status pills */}
          <StatusPills
            current={student.status}
            onChange={(s) => onStatusChange(student, s)}
            disabled={isSaving}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
const MarkAttendance: React.FC = () => {
  const queryClient = useQueryClient();
  const { upsertAttendance, useGetTodayAttendance, closeSession } = useAttendance();

  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all');
  const [syncStates, setSyncStates] = useState<SyncState>({});
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Optimistic local overrides — applied on top of server data while saving
  const [localOverrides, setLocalOverrides] = useState<Record<number, AttendanceStatus>>({});

  // Debounce search (3 char min)
  useEffect(() => {
    if (searchInput === '') { setDebouncedSearch(''); return; }
    if (searchInput.length < 3) { setDebouncedSearch(''); return; }
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page on search/filter change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter]);

  // Fetch today's session
  const {
    data: todayData,
    isLoading,
    refetch: refetchToday,
  } = useGetTodayAttendance({
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const summary = todayData?.summary ?? {};
  const pagination = todayData?.pagination;
  const serverStudents: StudentRow[] = todayData?.students ?? [];

  // Apply optimistic overrides on top of server data
  const students = useMemo(() => {
    return serverStudents.map(s => ({
      ...s,
      status: localOverrides[s.student_id] ?? s.status,
    }));
  }, [serverStudents, localOverrides]);

  // Sync indicator helpers
  const setSaving = (id: number) =>
    setSyncStates(p => ({ ...p, [id]: { status: 'saving' } }));
  const setSaved = (id: number) =>
    setSyncStates(p => ({ ...p, [id]: { status: 'saved' } }));
  const setError = (id: number, msg: string) =>
    setSyncStates(p => ({ ...p, [id]: { status: 'error', errorMessage: msg } }));
  const clearSync = (id: number) =>
    setSyncStates(p => { const n = { ...p }; delete n[id]; return n; });

  // ---------------------------------------------------------------------------
  // Mark individual student
  // ---------------------------------------------------------------------------
  const handleStatusChange = useCallback(async (student: StudentRow, newStatus: AttendanceStatus) => {
    if (newStatus === 'unmarked') return;

    // Optimistic update immediately
    setLocalOverrides(p => ({ ...p, [student.student_id]: newStatus }));
    setSaving(student.student_id);

    try {
      await upsertAttendance({
        student: student.student_id,
        status: newStatus,
        date: selectedDate,
        notes: `${STATUS_CONFIG[newStatus].label} - Marked via attendance`,
      });

      setSaved(student.student_id);
      setTimeout(() => {
        clearSync(student.student_id);
        // Remove override — server data is now correct
        setLocalOverrides(p => { const n = { ...p }; delete n[student.student_id]; return n; });
        refetchToday();
      }, 1200);

      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    } catch (error: any) {
      // Roll back optimistic update
      setLocalOverrides(p => { const n = { ...p }; delete n[student.student_id]; return n; });
      setError(student.student_id, error?.response?.data?.message || 'Failed to save');
      setTimeout(() => clearSync(student.student_id), 3000);
      toast.error(`Failed to mark ${student.student_name}`);
    }
  }, [selectedDate, upsertAttendance, queryClient, refetchToday]);

  // ---------------------------------------------------------------------------
  // Close session
  // ---------------------------------------------------------------------------
  const handleCloseSession = async () => {
    setIsClosingSession(true);
    try {
      await closeSession({ date: selectedDate });
      setShowCloseModal(false);
      toast.success('Session closed. Unmarked students set to Absent.');
      setLocalOverrides({});
      refetchToday();
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to close session');
    } finally {
      setIsClosingSession(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Computed stats from summary
  // ---------------------------------------------------------------------------
  const markedCount = summary.marked ?? 0;
  const totalCount = summary.total_students ?? 0;
  const unmarkedCount = summary.unmarked ?? 0;
  const progressPct = totalCount > 0 ? Math.round((markedCount / totalCount) * 100) : 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto pb-24">

      {/* ── Top header ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center">
              <BookOpen size={18} className="text-white dark:text-slate-900" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Attendance</h1>
              <p className="text-[11px] text-slate-400">
                {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={() => refetchToday()}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 active:scale-95 transition-transform"
              title="Refresh"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>

            {/* Close Session */}
            <button
              onClick={() => setShowCloseModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold active:scale-95 transition-transform"
            >
              <Lock size={14} />
              <span>Close Session</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
            <span>{markedCount} of {totalCount} marked</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-slate-900 dark:bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {(['present', 'late', 'excused', 'sick', 'absent', 'unmarked'] as AttendanceStatus[]).map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = summary[s] ?? 0;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(prev => prev === s ? 'all' : s)}
                className={`
                  flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all
                  ${statusFilter === s ? `${cfg.bgColor} ${cfg.borderColor} ${cfg.textColor}` : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                {cfg.label} {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search bar ─────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search name or phone (3+ chars)…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {searchInput.length > 0 && searchInput.length < 3 && (
          <p className="text-[11px] text-slate-400 mt-1.5 ml-1">Type {3 - searchInput.length} more character{3 - searchInput.length !== 1 ? 's' : ''} to search</p>
        )}
      </div>

      {/* ── Student list ───────────────────────────────────────── */}
      <div className="px-4 space-y-2.5">
        {isLoading && students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin text-slate-300" />
            <p className="text-sm text-slate-400">Loading students…</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20">
            <Users size={36} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No students found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchInput.length >= 3
                ? `No results for "${searchInput}"`
                : statusFilter !== 'all'
                ? `No students with status "${STATUS_CONFIG[statusFilter as AttendanceStatus].label}"`
                : 'No students available'}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {students.map((student, idx) => (
              <StudentCard
                key={student.student_id}
                student={student}
                syncState={syncStates[student.student_id]}
                onStatusChange={handleStatusChange}
                index={idx}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────────── */}
      {pagination && pagination.total_pages > 1 && (
        <div className="sticky bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-4 py-3 mt-4">
          <div className="flex items-center justify-between gap-3">
            <button
              disabled={!pagination.has_previous}
              onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <span className="text-xs text-slate-400">
              Page {pagination.current_page} of {pagination.total_pages}
              <span className="ml-1 text-slate-300 dark:text-slate-600">({pagination.total_items} students)</span>
            </span>

            <button
              disabled={!pagination.has_next}
              onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Close Session Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showCloseModal && (
          <CloseSessionModal
            summary={summary}
            onConfirm={handleCloseSession}
            onCancel={() => setShowCloseModal(false)}
            isClosing={isClosingSession}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarkAttendance;