import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/utils/validation';
import { 
  School, 
  Phone, 
  Lock, 
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronRight,
  Shield,
  Users,
  BookOpen
} from 'lucide-react';

type LoginFormData = {
  phone: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Demo credentials for quick testing
  const demoCredentials = [
    { role: 'Admin (Ustadh)', phone: '7123456', password: 'admin123', type: 'admin' },
    { role: 'Student', phone: '5345678', password: 'student123', type: 'student' },
    { role: 'Student', phone: '6456789', password: 'student123', type: 'student' },
  ];

  const fillDemoCredentials = (phone: string, password: string) => {
    setValue('phone', phone);
    setValue('password', password);
  };

  const handleDemoLogin = async (phone: string, password: string) => {
    fillDemoCredentials(phone, password);
    // Small delay to ensure form values are set
    setTimeout(async () => {
      try {
        await login({ phone, password });
      } catch (error) {
        console.error('Demo login failed:', error);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 dark:from-primary-950 dark:via-primary-900 dark:to-primary-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Info Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex flex-col justify-center space-y-8"
          >
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-white/20 p-3 rounded-xl">
                  <School className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-300">Ana-Muslimah</h2>
                  <p className="text-primary-600 dark:text-primary-400">School Management System</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-primary-700 dark:text-primary-300 font-semibold">Secure Access</h3>
                    <p className="text-primary-600 dark:text-primary-400 text-sm">Your data is protected with enterprise-grade security</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-primary-700 dark:text-primary-300 font-semibold">Role-Based Access</h3>
                    <p className="text-primary-600 dark:text-primary-400 text-sm">Different portals for students and admins</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-primary-700 dark:text-primary-300 font-semibold">Track Progress</h3>
                    <p className="text-primary-600 dark:text-primary-400 text-sm">Monitor attendance and academic performance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-primary-600 dark:text-primary-400 text-sm">
              <p>© {new Date().getFullYear()} Ana-Muslimah. All rights reserved.</p>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-surface rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-primary-600 p-6 text-center">
              <School className="h-12 w-12 text-white mx-auto mb-2" />
              <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
              <p className="text-primary-100 mt-1">Sign in to continue to your account</p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted group-focus-within:text-primary-500 transition-colors" />
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="7123456"
                      autoComplete="tel"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-background ${
                        errors.phone ? 'border-error-500' : 'border-border'
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 text-sm text-error-600 flex items-center gap-1"
                      >
                        <AlertCircle size={14} />
                        {errors.phone.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <p className="mt-1 text-xs text-muted">
                    7 digits starting with 2,4,5,6,7, or 9
                  </p>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted group-focus-within:text-primary-500 transition-colors" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-background ${
                        errors.password ? 'border-error-500' : 'border-border'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 text-sm text-error-600 flex items-center gap-1"
                      >
                        <AlertCircle size={14} />
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-border rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-muted">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-surface text-muted">Demo Credentials</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  {demoCredentials.map((cred, index) => (
                    <button
                      key={index}
                      onClick={() => handleDemoLogin(cred.phone, cred.password)}
                      className="w-full text-left p-3 bg-surface-hover rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all group border border-border hover:border-primary-200 dark:hover:border-primary-800"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {cred.role} Account
                          </p>
                          <p className="text-xs text-muted mt-0.5">
                            Phone: {cred.phone} | Password: {cred.password}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to login
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted group-hover:text-primary-600 transition-colors" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Create an account
                  </Link>
                </p>
              </div>

              {/* Info Note */}
              <div className="mt-6 p-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg border border-primary-100 dark:border-primary-800">
                <div className="flex items-start gap-2">
                  <School className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-primary-700 dark:text-primary-300">
                    Click on any demo credential to automatically fill and login. 
                    Admin accounts have full access, while student accounts can only view their own attendance.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;