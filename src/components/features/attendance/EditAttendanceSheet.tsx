// src/components/attendance/EditAttendanceSheet.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Calendar, 
  FileText, 
  UserCheck,
  AlertCircle,
  Clock,
  Heart,
  Activity
} from 'lucide-react';
import { useAttendance } from '@/hooks/useAttendance';
import toast from 'react-hot-toast';

interface EditAttendanceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  onSuccess?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', color: 'text-success-600', bgColor: 'bg-success-50 dark:bg-success-950/30', icon: UserCheck },
  { value: 'absent', label: 'Absent', color: 'text-error-600', bgColor: 'bg-error-50 dark:bg-error-950/30', icon: X },
  { value: 'late', label: 'Late', color: 'text-warning-600', bgColor: 'bg-warning-50 dark:bg-warning-950/30', icon: Clock },
  { value: 'excused', label: 'Excused', color: 'text-primary-600', bgColor: 'bg-primary-50 dark:bg-primary-950/30', icon: AlertCircle },
  { value: 'sick', label: 'Sick', color: 'text-accent-600', bgColor: 'bg-accent-50 dark:bg-accent-950/30', icon: Heart },
];

export const EditAttendanceSheet: React.FC<EditAttendanceSheetProps> = ({
  isOpen,
  onClose,
  record,
  onSuccess,
}) => {
  const { updateAttendance, isUpdating } = useAttendance();
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
  });
  const [errors, setErrors] = useState<{ status?: string; notes?: string }>({});

  useEffect(() => {
    if (record) {
      setFormData({
        status: record.status || '',
        notes: record.notes || '',
      });
    }
  }, [record]);

  const validateForm = () => {
    const newErrors: { status?: string; notes?: string } = {};
    
    if (!formData.status) {
      newErrors.status = 'Please select a status';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!record?.id) {
      toast.error('Invalid record');
      return;
    }
    
    try {
      await updateAttendance({
        id: record.id,
        data: {
          status: formData.status,
          notes: formData.notes,
        },
      });
      
      toast.success('Attendance updated successfully');
      onClose();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update attendance';
      toast.error(errorMessage);
      
      // Handle specific field errors from backend
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const handleStatusSelect = (statusValue: string) => {
    setFormData(prev => ({ ...prev, status: statusValue }));
    if (errors.status) {
      setErrors(prev => ({ ...prev, status: undefined }));
    }
  };

  const currentStatus = STATUS_OPTIONS.find(opt => opt.value === formData.status);
  const StatusIcon = currentStatus?.icon || Activity;

  return (
    <AnimatePresence>
      {isOpen && record && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${currentStatus?.bgColor || 'bg-surface-hover'}`}>
                  <StatusIcon className={`h-5 w-5 ${currentStatus?.color || 'text-muted'}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Edit Attendance</h2>
                  <p className="text-xs text-muted">Update attendance record</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-6">
              {/* Date Display (Read-only) */}
              <div className="bg-surface-hover rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted" />
                  <span className="text-sm font-medium text-muted">Date</span>
                </div>
                <p className="text-foreground font-medium">
                  {new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Student Info (Read-only) */}
              {record.student_name && (
                <div className="bg-surface-hover rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="h-4 w-4 text-muted" />
                    <span className="text-sm font-medium text-muted">Student</span>
                  </div>
                  <p className="text-foreground font-medium">{record.student_name}</p>
                  {record.student_class && (
                    <p className="text-sm text-muted mt-1">Class: {record.student_class}</p>
                  )}
                </div>
              )}

              {/* Status Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = formData.status === option.value;
                    const OptionIcon = option.icon;
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleStatusSelect(option.value)}
                        className={`
                          flex items-center gap-2 p-3 rounded-lg border transition-all
                          ${isSelected 
                            ? `${option.bgColor} border-${option.value === 'present' ? 'success' : option.value === 'absent' ? 'error' : option.value === 'late' ? 'warning' : option.value === 'excused' ? 'primary' : 'accent'}-500 ring-2 ring-offset-2 ring-${option.value === 'present' ? 'success' : option.value === 'absent' ? 'error' : option.value === 'late' ? 'warning' : option.value === 'excused' ? 'primary' : 'accent'}-500` 
                            : 'bg-surface border-border hover:border-muted'
                          }
                        `}
                      >
                        <OptionIcon className={`h-4 w-4 ${isSelected ? option.color : 'text-muted'}`} />
                        <span className={`text-sm font-medium ${isSelected ? option.color : 'text-foreground'}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.status && (
                  <p className="text-xs text-error-600 mt-1">{errors.status}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted" />
                    Notes (Optional)
                  </div>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, notes: e.target.value }));
                    if (errors.notes) {
                      setErrors(prev => ({ ...prev, notes: undefined }));
                    }
                  }}
                  placeholder="Add any additional notes about this attendance record..."
                  rows={4}
                  className="input w-full resize-none"
                />
                <p className="text-xs text-muted">
                  Provide reason for absence, late arrival, or any other relevant information
                </p>
                {errors.notes && (
                  <p className="text-xs text-error-600 mt-1">{errors.notes}</p>
                )}
              </div>

              {/* Original Record Info */}
              {record.marked_by_name && (
                <div className="bg-muted/5 rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted">
                    Originally marked by: <span className="font-medium">{record.marked_by_name}</span>
                  </p>
                  {record.created_at && (
                    <p className="text-xs text-muted mt-1">
                      Created: {new Date(record.created_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn btn-secondary"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditAttendanceSheet;