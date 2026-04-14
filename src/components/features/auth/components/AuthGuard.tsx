import React from 'react';
import { useRouter } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Check if we're on a public route
  const isPublicRoute = window.location.pathname === '/login' || 
                        window.location.pathname === '/register';
  
  if (!user && !isPublicRoute) {
    router.navigate({ to: '/login' });
    return null;
  }
  
  if (user && isPublicRoute) {
    // Redirect to appropriate dashboard
    if (user.user_type === 'admin') {
      router.navigate({ to: '/admin' });
    } else {
      router.navigate({ to: '/student' });
    }
    return null;
  }
  
  return <>{children}</>;
};