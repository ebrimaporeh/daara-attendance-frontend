import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@/routes/root';
import { PublicLayout } from '@/pages/public/PublicLayout';
import HomePage from '@/pages/public/HomePage';
import AboutPage from '@/pages/public/AboutPage';
import ContactPage from '@/pages/public/ContactPage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';

// Public layout route
// export const publicLayoutRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: '/',
//   component: PublicLayout,
// });

export const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public-layout',
  component: PublicLayout,
});


// Home page
export const homeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/',
  component: HomePage,
});

// About page
export const aboutRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/about',
  component: AboutPage,
});

// Contact page
export const contactRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/contact',
  component: ContactPage,
});

// Login page (no layout wrapper)
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Register page (no layout wrapper)
export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

// Export all public routes
export const publicChildRoutes = [
  homeRoute,
  aboutRoute,
  contactRoute,
  loginRoute,
  registerRoute,
];