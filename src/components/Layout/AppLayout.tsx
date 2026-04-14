import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from '@tanstack/react-router';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  
  // Don't render layout for public routes
  const isPublicRoute = window.location.pathname === '/login' || 
                        window.location.pathname === '/register';
  
  if (isPublicRoute) {
    return <>{children}</>;
  }
  
  // The actual layout will be handled by role-specific layouts
  return <>{children}</>;
};

export default AppLayout;