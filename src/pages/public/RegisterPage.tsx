import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema } from '@/utils/validation';
import { extractApiError } from '@/utils/errorHandler';
import { z } from 'zod';
import { 
  School, 
  User as UserIcon, 
  Phone, 
  Lock, 
  Mail, 
  Users,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { register: registerUser, isRegistering, registerError } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      user_type: 'student',
    },
  });

  const onSubmit = handleSubmit(async (data: RegisterFormData) => {
    try {
      await registerUser(data);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  });

  const apiError = registerError ? extractApiError(registerError) : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
      >
        <div className="bg-primary-600 p-6 text-center">
          <School className="h-12 w-12 text-white mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-primary-100 mt-1">Join Ana-Muslimah School Management System</p>
        </div>

        <div className="p-8">
          {/* API Error Alert */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Registration Failed
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      {apiError.message}
                    </p>
                    {apiError.fieldErrors && (
                      <ul className="mt-2 text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                        {Object.entries(apiError.fieldErrors).map(([field, messages]) => (
                          <li key={field}>
                            <span className="font-medium">{field}:</span> {messages[0]}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Hidden user_type input */}
            <input type="hidden" {...register('user_type')} value="student" />

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    {...register('first_name')}
                    type="text"
                    placeholder="Enter first name"
                    className={`input pl-10 ${apiError?.fieldErrors?.first_name ? 'border-red-500' : ''}`}
                  />
                </div>
                <AnimatePresence>
                  {errors.first_name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={14} />
                      {errors.first_name.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="label">Last Name *</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    {...register('last_name')}
                    type="text"
                    placeholder="Enter last name"
                    className={`input pl-10 ${apiError?.fieldErrors?.last_name ? 'border-red-500' : ''}`}
                  />
                </div>
                <AnimatePresence>
                  {errors.last_name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={14} />
                      {errors.last_name.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Father's Name */}
            <div>
              <label className="label">Father's Name *</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                <input
                  {...register('fathers_first_name')}
                  type="text"
                  placeholder="Enter father's first name"
                  className={`input pl-10 ${apiError?.fieldErrors?.fathers_first_name ? 'border-red-500' : ''}`}
                />
              </div>
              <AnimatePresence>
                {errors.fathers_first_name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    {errors.fathers_first_name.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="7123456"
                    className={`input pl-10 ${apiError?.fieldErrors?.phone ? 'border-red-500' : ''}`}
                  />
                </div>
                <AnimatePresence>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={14} />
                      {errors.phone.message}
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="mt-1 text-xs text-muted">
                  Use a Gambian number (7 digits without (+220))
                </p>
              </div>

              <div>
                <label className="label">Email (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className={`input pl-10 ${apiError?.fieldErrors?.email ? 'border-red-500' : ''}`}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={14} />
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className={`input pl-10 ${apiError?.fieldErrors?.password ? 'border-red-500' : ''}`}
                  />
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={14} />
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="label">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    {...register('confirm_password')}
                    type="password"
                    placeholder="••••••••"
                    className={`input pl-10 ${apiError?.fieldErrors?.confirm_password ? 'border-red-500' : ''}`}
                  />
                </div>
                <AnimatePresence>
                  {errors.confirm_password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={14} />
                      {errors.confirm_password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-surface-hover rounded-lg p-3">
              <p className="text-xs text-foreground mb-2">Password requirements:</p>
              <ul className="text-xs text-muted space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle size={12} />
                  At least 8 characters long
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={12} />
                  Cannot be too common or similar to personal info
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isRegistering ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>Register as Student</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Login here
              </Link>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-950/30 rounded-lg border border-primary-100 dark:border-primary-800">
            <div className="flex items-start gap-3">
              <School className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm text-primary-800 dark:text-primary-300 font-medium">Student Registration Only</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                  This registration form is for students only. Admin accounts must be created 
                  by an existing administrator. Please contact the school administration if 
                  you need admin access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;