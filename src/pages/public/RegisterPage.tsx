import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Link, useRouter } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema } from '@/utils/validation';
import { 
  School, 
  User as UserIcon, 
  Phone, 
  Lock, 
  Mail, 
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

type RegisterFormData = {
  first_name: string;
  last_name: string;
  fathers_first_name: string;
  phone: string;
  email?: string;
  password: string;
  confirm_password: string;
  user_type: 'student' | 'admin';
};

const RegisterPage: React.FC = () => {
  const { register: registerUser, isRegistering } = useAuth();
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      user_type: 'student',
    },
  });

  const userType = watch('user_type');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      // After successful registration, user will be automatically logged in
      // and AuthGuard will redirect to appropriate dashboard
    } catch (error) {
      // Error is handled by the hook
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
      >
        <div className="bg-primary-600 p-6 text-center">
          <School className="h-12 w-12 text-white mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-primary-100 mt-1">Join An-Namuslimah School Management System</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* User Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                userType === 'student' 
                  ? 'border-primary-600 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="student"
                  {...register('user_type')}
                  className="sr-only"
                />
                <div className="text-center">
                  <Users className={`h-6 w-6 mx-auto mb-2 ${
                    userType === 'student' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    userType === 'student' ? 'text-primary-600' : 'text-gray-600'
                  }`}>
                    Student
                  </span>
                </div>
              </label>

              <label className={`relative flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                userType === 'admin' 
                  ? 'border-primary-600 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="admin"
                  {...register('user_type')}
                  className="sr-only"
                />
                <div className="text-center">
                  <UserIcon className={`h-6 w-6 mx-auto mb-2 ${
                    userType === 'admin' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    userType === 'admin' ? 'text-primary-600' : 'text-gray-600'
                  }`}>
                    Admin
                  </span>
                </div>
              </label>
            </div>
            {errors.user_type && (
              <p className="text-sm text-red-600">{errors.user_type.message}</p>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('first_name')}
                    type="text"
                    placeholder="Enter first name"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('last_name')}
                    type="text"
                    placeholder="Enter last name"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Father's Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Father's Name *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register('fathers_first_name')}
                  type="text"
                  placeholder="Enter father's first name"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {errors.fathers_first_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.fathers_first_name.message}
                </p>
              )}
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="7123456"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.phone.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  7 digits starting with 2,4,5,6,7, or 9
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('confirm_password')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-2">Password requirements:</p>
              <ul className="text-xs text-gray-500 space-y-1">
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
                  <span>Register</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <School className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">About Registration</p>
                <p className="text-xs text-blue-600 mt-1">
                  Students can register themselves. Admin accounts need to be approved 
                  or created by an existing admin. If registering as admin, you'll need 
                  to contact the school administrator for approval.
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