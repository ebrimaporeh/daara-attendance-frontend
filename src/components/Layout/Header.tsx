import React from 'react';
import { motion } from 'framer-motion';
import { User, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Menu, Transition } from '@headlessui/react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome back, {user?.first_name}!
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {user?.user_type === 'admin' ? 'Administrator' : 'Student'} Dashboard
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 focus:outline-none">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <span className="text-gray-700">{user?.first_name} {user?.last_name}</span>
              <ChevronDown size={16} className="text-gray-400" />
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
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href={user?.user_type === 'admin' ? '/admin/profile' : '/student/profile'}
                      className={`block px-4 py-2 text-sm ${
                        active ? 'bg-gray-100' : ''
                      }`}
                    >
                      Profile Settings
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${
                        active ? 'bg-gray-100' : ''
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