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
  Users,
  LogOut,
  Eye,
  EyeOff,
  Shield,
  Settings,
  Bell,
  Activity,
  BarChart3,
  School
} from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { changePasswordSchema } from '@/utils/validation';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const AdminProfile: React.FC = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { useGetAllUsers } = useUsers();
  const { useGetAttendanceSummary } = useAttendance();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');
  const [editFormData, setEditFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    fathers_first_name: user?.fathers_first_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const { data: allUsers } = useGetAllUsers();
  const { data: monthlySummary } = useGetAttendanceSummary({ 
    month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` 
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Calculate admin stats
  const stats = React.useMemo(() => {
    const totalStudents = allUsers?.filter(u => u.user_type === 'student').length || 0;
    const totalAdmins = allUsers?.filter(u => u.user_type === 'admin').length || 0;
    const activeToday = allUsers?.filter(u => u.is_active !== false).length || 0;
    
    return { totalStudents, totalAdmins, activeToday, totalUsers: allUsers?.length || 0 };
  }, [allUsers]);

  // Mock activity data for chart
  const activityData = [
    { month: 'Jan', actions: 45 },
    { month: 'Feb', actions: 52 },
    { month: 'Mar', actions: 48 },
    { month: 'Apr', actions: 61 },
    { month: 'May', actions: 55 },
    { month: 'Jun', actions: 67 },
  ];

  const handleEditSubmit = async () => {
    try {
      await updateProfile(editFormData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update profile');
    }
  };

  // FIXED: changePassword expects an object with oldPassword and newPassword
  const handlePasswordChange = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({
        oldPassword: data.old_password,
        newPassword: data.new_password
      });
      setIsChangingPassword(false);
      reset();
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Password change failed:', error);
      toast.error('Failed to change password');
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Profile</h1>
          <p className="text-muted text-sm mt-1">Manage your account settings and preferences</p>
        </div>
        <div className="flex gap-2">
          {!isEditing && activeTab === 'profile' && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('security');
              setIsChangingPassword(true);
            }}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Lock size={18} />
            Change Password
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'activity', label: 'Activity', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-all relative ${
                  isActive ? 'text-primary-600' : 'text-muted hover:text-foreground'
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

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <>
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
                  <p className="text-primary-100 mt-1">System Administrator</p>
                  <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs text-white">
                      <Calendar size={12} />
                      Joined {formatDate(user.date_joined || new Date().toISOString())}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-500/20 rounded-full text-xs text-success-100">
                      <CheckCircle size={12} />
                      Active Admin
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500/20 rounded-full text-xs text-primary-100">
                      <Shield size={12} />
                      Administrator
                    </span>
                  </div>
                </div>

                {/* Admin Stats */}
                <div className="grid grid-cols-2 gap-4 min-w-[200px]">
                  <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
                    <div className="text-xs text-primary-100">Students</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">{monthlySummary?.attendance_rate || 0}%</div>
                    <div className="text-xs text-primary-100">Attendance Rate</div>
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
                  <p className="text-muted text-sm">Total Students</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-950/30 p-3 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm">Total Admins</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalAdmins}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-950/30 p-3 rounded-full">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeToday}</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-950/30 p-3 rounded-full">
                  <Activity className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-950/30 p-3 rounded-full">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* About & Info Cards */}
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
                  <span className="text-muted">Admin ID</span>
                  <span className="text-foreground font-medium">#{user.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted">Role</span>
                  <span className="text-foreground font-medium">System Administrator</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted">Member Since</span>
                  <span className="text-foreground font-medium">
                    {formatDate(user.date_joined || new Date().toISOString())}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted">Last Login</span>
                  <span className="text-foreground font-medium">
                    {formatDate(user.last_login || new Date().toISOString())}
                  </span>
                </div>
              </div>
            </div>

            {/* System Info Card */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Settings size={20} />
                System Information
              </h3>
              <div className="space-y-4">
                <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <School size={16} className="text-primary-600" />
                    <span className="font-medium text-foreground">School Management System</span>
                  </div>
                  <p className="text-sm text-muted">Version 1.0.0</p>
                </div>
                
                <div className="bg-surface-hover rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell size={16} className="text-warning-600" />
                    <span className="font-medium text-foreground">Notifications</span>
                  </div>
                  <p className="text-sm text-muted">Email notifications enabled</p>
                </div>
                
                <div className="bg-surface-hover rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={16} className="text-success-600" />
                    <span className="font-medium text-foreground">Security Status</span>
                  </div>
                  <p className="text-sm text-muted">Two-factor authentication available</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock size={20} />
              Change Password
            </h3>
            <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4 max-w-md">
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

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setActiveTab('profile');
                  }}
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
          </div>

          {/* Session Management Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity size={20} />
              Active Sessions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  <div>
                    <p className="font-medium text-foreground">Current Session</p>
                    <p className="text-xs text-muted">Chrome on Windows</p>
                  </div>
                </div>
                <span className="text-xs text-muted">Active now</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <div>
                    <p className="font-medium text-foreground">Mobile Session</p>
                    <p className="text-xs text-muted">Safari on iPhone</p>
                  </div>
                </div>
                <span className="text-xs text-muted">2 hours ago</span>
              </div>
            </div>
            <button className="btn btn-secondary w-full mt-4">
              Logout All Other Sessions
            </button>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Activity Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Admin Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityData}>
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
                  dataKey="actions"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  name="Actions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity Log */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity size={20} />
              Recent Activity Log
            </h3>
            <div className="space-y-3">
              {[
                { action: 'Marked attendance for 45 students', time: '10 minutes ago', icon: CheckCircle },
                { action: 'Added new student account', time: '1 hour ago', icon: User },
                { action: 'Updated system settings', time: '3 hours ago', icon: Settings },
                { action: 'Generated monthly report', time: 'Yesterday', icon: BarChart3 },
                { action: 'Logged in from new device', time: 'Yesterday', icon: Shield },
              ].map((log, idx) => {
                const Icon = log.icon;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 dark:bg-primary-950/30 p-2 rounded-lg">
                        <Icon size={16} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{log.action}</p>
                        <p className="text-xs text-muted">{log.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="btn btn-secondary w-full mt-4">
              View All Activity
            </button>
          </div>

          {/* System Health */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity size={20} />
              System Health
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-success-50 dark:bg-success-950/30 rounded-lg">
                <div className="text-2xl font-bold text-success-600">99.9%</div>
                <div className="text-xs text-muted">Uptime</div>
              </div>
              <div className="text-center p-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">1.2s</div>
                <div className="text-xs text-muted">Response Time</div>
              </div>
              <div className="text-center p-3 bg-warning-50 dark:bg-warning-950/30 rounded-lg">
                <div className="text-2xl font-bold text-warning-600">156</div>
                <div className="text-xs text-muted">Active Users</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">98%</div>
                <div className="text-xs text-muted">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    placeholder="admin@example.com"
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
    </div>
  );
};

export default AdminProfile;