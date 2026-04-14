import React from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { LayoutDashboard, CalendarCheck, User, LogOut, School } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes/routes';

const navItems = [
  { path: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.STUDENT_ATTENDANCE, label: 'My Attendance', icon: CalendarCheck },
  { path: ROUTES.STUDENT_PROFILE, label: 'Profile', icon: User },
];

export const StudentSidebar: React.FC = () => {
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
      className="w-64 bg-white shadow-lg flex flex-col"
    >
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <School className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">An-Namuslimah</h1>
            <p className="text-xs text-gray-500">Student Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            activeProps={{
              className: "bg-primary-50 text-primary-700 border-r-4 border-primary-600"
            }}
            inactiveProps={{
              className: "text-gray-600 hover:bg-gray-100"
            }}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200"
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};