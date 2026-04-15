import React from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  User, 
  LogOut,
  School,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes/routes';

const navItems = [
  { path: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.STUDENT_ATTENDANCE, label: 'Attendance', icon: CalendarCheck },
  { path: ROUTES.STUDENT_PROFILE, label: 'Profile', icon: User },
];

interface StudentSidebarProps {
  onClose?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.invalidate();
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-surface border-r border-border flex flex-col h-full relative"
    >
      {/* Close button for mobile */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors md:hidden"
        >
          <X size={20} />
        </button>
      )}

      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
            <School className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Ana-Muslimah</h1>
            <p className="text-xs text-muted">Student Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            activeProps={{
              className: "bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border-r-4 border-primary-600"
            }}
            inactiveProps={{
              className: "text-muted hover:bg-surface-hover hover:text-foreground"
            }}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200"
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-error-600 hover:bg-error-50 dark:hover:bg-error-950/30 transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};