import React from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { Bell, ChevronDown, User, Moon, Sun } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes/routes';
import { useTheme } from '@/hooks/useTheme';

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  // const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.invalidate();
  };

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-40">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome back, {user?.first_name}!
          </h2>
          <p className="text-sm text-muted mt-1">Administrator Dashboard</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          {/* <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button> */}

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 focus:outline-none hover:bg-surface-hover rounded-lg px-2 py-1 transition-colors">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-foreground font-medium">
                {user?.first_name} {user?.last_name}
              </span>
              <ChevronDown size={16} className="text-muted" />
            </Menu.Button>

            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to={ROUTES.ADMIN_PROFILE}
                      className={`block px-4 py-2 text-sm ${
                        active ? 'bg-surface-hover text-foreground' : 'text-muted'
                      }`}
                    >
                      Profile Settings
                    </Link>
                  )}
                </Menu.Item>
               
                <div className="border-t border-border my-1"></div>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        active ? 'bg-error-50 dark:bg-error-950/30 text-error-600' : 'text-error-600'
                      }`}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};