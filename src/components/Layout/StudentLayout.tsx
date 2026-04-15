import React, { useState } from 'react';
import { Outlet, Navigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentSidebar } from '../StudentSidebar';
import { StudentHeader } from '../StudentHeader';
import { StudentMobileNav } from '../StudentMobileNav';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Menu } from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Close mobile menu when screen size changes to desktop
  React.useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <StudentSidebar />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <StudentSidebar onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <div className="md:hidden bg-surface border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg text-foreground hover:bg-surface-hover transition-colors"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center space-x-2">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded-lg">
                  <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <span className="font-semibold text-foreground text-sm">
                  {user?.first_name}
                </span>
              </div>
              <div className="w-10" />
            </div>
          </div>
        )}
        
        {/* Desktop Header */}
        <div className="hidden md:block flex-shrink-0">
          <StudentHeader />
        </div>
        
        {/* Main Content - Fixed layout */}
        <div className="flex-1 overflow-y-auto">
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-4 md:p-6 ${isMobile ? 'pb-20' : ''}`}
          >
            <Outlet />
          </motion.main>
        </div>
        
        {/* Mobile Bottom Navigation - Fixed to bottom */}
        {isMobile && <StudentMobileNav />}
      </div>
    </div>
  );
};