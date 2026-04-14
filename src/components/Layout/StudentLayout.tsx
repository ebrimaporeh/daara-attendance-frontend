import React from 'react';
import { Outlet, Navigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { StudentSidebar } from '../StudentSidebar';
import { StudentHeader } from '../StudentHeader';
import { useAuth } from '@/hooks/useAuth';

export const StudentLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user || user.user_type !== 'student') {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="flex h-screen bg-background">
      <StudentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};