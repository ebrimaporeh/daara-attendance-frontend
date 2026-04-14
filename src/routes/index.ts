// src/routes/index.ts
import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './root';

import { studentChildRoutes } from './student';
import { studentLayoutRoute } from './student';

import { adminLayoutRoute } from './admin';
import { adminChildRoutes } from './admin';


import { publicLayoutRoute, publicChildRoutes } from './public';



const routeTree = rootRoute.addChildren([

    studentLayoutRoute.addChildren(studentChildRoutes),
    adminLayoutRoute.addChildren(adminChildRoutes),
    publicLayoutRoute.addChildren(publicChildRoutes)
])





// Create the router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultStaleTime: 0,
});

// Register router for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}