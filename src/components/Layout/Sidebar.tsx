import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  PenSquare, 
  BarChart3, 
  User, 
  Settings,
  LogOut,
  School
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/routes/routes';
import { adminRoutes } from '@/routes/admin';
import { studentRoutes } from '@/routes/student';

export const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();

  const getNavItems = () => {
    if (isAdmin) {
      return adminRoutes.map(route => ({
        path: route.path,
        label: route.title,
        icon: route.icon,
      }));
    }
    return studentRoutes.map(route => ({
      path: route.path,
      label: route.title,
      icon: 'User', // You can map icons accordingly
    }));
  };

  const navItems = getNavItems();

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
            <p className="text-xs text-gray-500">School Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            {item.icon === 'LayoutDashboard' && <LayoutDashboard size={20} />}
            {item.icon === 'Users' && <Users size={20} />}
            {item.icon === 'CalendarCheck' && <CalendarCheck size={20} />}
            {item.icon === 'PenSquare' && <PenSquare size={20} />}
            {item.icon === 'BarChart3' && <BarChart3 size={20} />}
            {item.icon === 'User' && <User size={20} />}
            {item.icon === 'Settings' && <Settings size={20} />}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};