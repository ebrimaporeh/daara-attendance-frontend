import React from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  PenSquare, 
  BarChart3, 
  User, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes/routes';

const navItems = [
  { path: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.ADMIN_STUDENTS, label: 'Students', icon: Users },
  { path: ROUTES.ADMIN_ATTENDANCE, label: 'Attendance', icon: CalendarCheck },
  { path: ROUTES.ADMIN_MARK_ATTENDANCE, label: 'Mark', icon: PenSquare },
  { path: ROUTES.ADMIN_REPORTS, label: 'Reports', icon: BarChart3 },
  { path: ROUTES.ADMIN_PROFILE, label: 'Profile', icon: User },
  { path: ROUTES.ADMIN_SETTINGS, label: 'Settings', icon: Settings },
];

export const AdminMobileNav: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const [showLogout, setShowLogout] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.invalidate();
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-30"
      >
        <div className="flex justify-around items-center px-2 py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              activeProps={{
                className: "text-primary-600 dark:text-primary-400"
              }}
              inactiveProps={{
                className: "text-muted"
              }}
              className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 active:scale-95"
            >
              <item.icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
          
          {/* More Menu Button */}
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 text-muted active:scale-95"
          >
            <Settings size={20} />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </motion.nav>

      {/* More Menu Popup */}
      {showLogout && (
        <>
          <div 
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setShowLogout(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-50 md:hidden"
          >
            <div className="bg-surface border border-border rounded-lg shadow-lg overflow-hidden min-w-[160px]">
              {/* Profile Link */}
              <Link
                to={ROUTES.ADMIN_PROFILE}
                onClick={() => setShowLogout(false)}
                className="flex items-center space-x-3 px-4 py-3 text-foreground hover:bg-surface-hover transition-colors"
              >
                <User size={18} />
                <span className="text-sm">Profile</span>
              </Link>
              
              {/* Settings Link */}
              <Link
                to={ROUTES.ADMIN_SETTINGS}
                onClick={() => setShowLogout(false)}
                className="flex items-center space-x-3 px-4 py-3 text-foreground hover:bg-surface-hover transition-colors border-t border-border"
              >
                <Settings size={18} />
                <span className="text-sm">Settings</span>
              </Link>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 text-error-600 hover:bg-error-50 dark:hover:bg-error-950/30 transition-colors border-t border-border w-full"
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* Bottom padding to account for navigation bar */}
      <div className="h-16 md:hidden" />
    </>
  );
};