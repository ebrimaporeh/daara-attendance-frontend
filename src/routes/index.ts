import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './root';
import { publicLayoutRoute, publicChildRoutes } from './public';
import { adminLayoutRoute, adminChildRoutes } from './admin';
import { studentLayoutRoute, studentChildRoutes } from './student';

// Build the complete route tree
const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren(publicChildRoutes),
  adminLayoutRoute.addChildren(adminChildRoutes),
  studentLayoutRoute.addChildren(studentChildRoutes),
]);

// Create the router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultStaleTime: 0,
});