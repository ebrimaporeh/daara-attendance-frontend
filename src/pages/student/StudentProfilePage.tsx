import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useAttendance } from '@/hooks/useAttendance';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  Save, 
  Edit2, 
  CheckCircle, 
  XCircle,
  Camera,
  Award,
  TrendingUp,
  Clock,
  LogOut,
  Eye,
  EyeOff,
  Shield,
  Heart,
  Target
} from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { changePasswordSchema } from '@/utils/validation';
import { z } from 'zod';

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const StudentProfile: React.FC = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { useGetUser } = useUsers();
  const { useGetStudentAttendance } = useAttendance();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    fathers_first_name: user?.fathers_first_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const { data: studentDetail } = useGetUser(user?.id || 0);
  const { data: attendanceRecords } = useGetStudentAttendance(user?.id || 0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Calculate attendance stats
  const stats = React.useMemo(() => {
    if (!attendanceRecords) return null;
    
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
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
    
    return { total, present, attendanceRate, streak };
  }, [attendanceRecords]);

  const handleEditSubmit = async () => {
    try {
      await updateProfile(editFormData);
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handlePasswordChange = async (data: ChangePasswordFormData) => {
    try {
      await changePassword(data);
      setIsChangingPassword(false);
      reset();
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      fathers_first_name: user?.fathers_first_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted text-sm mt-1">View and manage your personal information</p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          )}
          <button
            onClick={() => setIsChangingPassword(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Lock size={18} />
            Change Password
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-3xl md:text-4xl font-bold">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full text-white hover:bg-primary-700 transition-colors">
                <Camera size={16} />
              </button>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-primary-100 mt-1">d/o {user.fathers_first_name}</p>
              <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs text-white">
                  <Calendar size={12} />
                  Joined {formatDate(user.date_joined || new Date().toISOString())}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-500/20 rounded-full text-xs text-success-100">
                  <CheckCircle size={12} />
                  Active Student
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 min-w-[200px]">
              <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">
                  {stats?.attendanceRate || 0}%
                </div>
                <div className="text-xs text-primary-100">Attendance</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">
                  {stats?.streak || 0}
                </div>
                <div className="text-xs text-primary-100">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="p-4 bg-surface border-b border-border grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="text-muted" />
            <span className="text-foreground">{user.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail size={16} className="text-muted" />
            <span className="text-foreground">{user.email || 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Total Days</p>
              <p className="text-2xl font-bold text-foreground">{stats?.total || 0}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-950/30 p-3 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Present Days</p>
              <p className="text-2xl font-bold text-foreground">{stats?.present || 0}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-950/30 p-3 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Attendance Rate</p>
              <p className="text-2xl font-bold text-foreground">{stats?.attendanceRate || 0}%</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-950/30 p-3 rounded-full">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Current Streak</p>
              <p className="text-2xl font-bold text-foreground">{stats?.streak || 0}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-950/30 p-3 rounded-full">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsEditing(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface rounded-xl shadow-xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Edit Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
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
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Father's Name</label>
                  <input
                    type="text"
                    value={editFormData.fathers_first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, fathers_first_name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="input"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    className="input bg-muted/10"
                    disabled
                  />
                  <p className="text-xs text-muted mt-1">Phone number cannot be changed</p>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-surface border-t border-border p-4 flex gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isChangingPassword && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsChangingPassword(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface rounded-xl shadow-xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Change Password</h2>
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover"
                >
                  <XCircle size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(handlePasswordChange)} className="p-4 space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...register('old_password')}
                      className="input pl-10 pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.old_password && (
                    <p className="mt-1 text-sm text-error-600">{errors.old_password.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      {...register('new_password')}
                      className="input pl-10 pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.new_password && (
                    <p className="mt-1 text-sm text-error-600">{errors.new_password.message}</p>
                  )}
                  <p className="text-xs text-muted mt-1">Password must be at least 8 characters</p>
                </div>

                <div>
                  <label className="label">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirm_new_password')}
                      className="input pl-10 pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirm_new_password && (
                    <p className="mt-1 text-sm text-error-600">{errors.confirm_new_password.message}</p>
                  )}
                </div>

                <div className="sticky bottom-0 pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <>
                        <Lock size={16} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Info Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* About Card */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User size={20} />
            About Me
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted">Full Name</span>
              <span className="text-foreground font-medium">{user.first_name} {user.last_name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted">Father's Name</span>
              <span className="text-foreground font-medium">{user.fathers_first_name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted">Student ID</span>
              <span className="text-foreground font-medium">#{user.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted">Member Since</span>
              <span className="text-foreground font-medium">
                {formatDate(user.date_joined || new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Tips Card */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target size={20} />
            Quick Tips
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary-100 dark:bg-primary-950/30 p-2 rounded-lg">
                <Clock size={16} className="text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Attendance Matters</p>
                <p className="text-sm text-muted">Regular attendance helps you stay on track with your memorization goals.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-success-100 dark:bg-success-950/30 p-2 rounded-lg">
                <Award size={16} className="text-success-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Set Goals</p>
                <p className="text-sm text-muted">Aim for 95% attendance to maintain excellent progress.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-warning-100 dark:bg-warning-950/30 p-2 rounded-lg">
                <Heart size={16} className="text-warning-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Communicate</p>
                <p className="text-sm text-muted">Inform your teacher in advance if you'll be absent or late.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions Card */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield size={20} />
          Account Actions
        </h3>
        <div className="space-y-3">
          <button
            onClick={() => setIsChangingPassword(true)}
            className="w-full btn btn-secondary flex items-center justify-center gap-2"
          >
            <Lock size={18} />
            Change Password
          </button>
          <button
            onClick={() => logout()}
            className="w-full btn btn-danger flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Progress Message */}
      {stats?.attendanceRate && parseFloat(stats.attendanceRate) >= 90 && (
        <div className="bg-success-50 dark:bg-success-950/20 rounded-lg p-4 border border-success-200 dark:border-success-800">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-success-600" />
            <div>
              <p className="font-semibold text-success-800 dark:text-success-300">Excellent Performance!</p>
              <p className="text-sm text-success-700 dark:text-success-400">
                You have {stats.attendanceRate}% attendance. Keep up the great work!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;