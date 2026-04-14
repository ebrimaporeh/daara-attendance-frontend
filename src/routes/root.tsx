import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
// import { AuthGuard } from '@/components/features/auth/components/AuthGuard';
import AppLayout from '../components/Layout/AppLayout';
import { AuthGuard } from '@/components/features/auth/components/AuthGuard';

const RootComponent = () => {
  return (
    <AuthGuard>
      <AppLayout>
        <Outlet />
      </AppLayout>
     </AuthGuard>
  );
};

export const rootRoute = createRootRoute({
  component: RootComponent,
});