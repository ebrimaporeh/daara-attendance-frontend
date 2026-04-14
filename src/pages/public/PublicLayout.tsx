import React from 'react';
import { Outlet, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { School, BookOpen, Users, Award, ChevronRight, Menu, X } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export const PublicLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const features = [
    {
      icon: BookOpen,
      title: 'Islamic Education',
      description: 'Comprehensive Quran memorization and Islamic studies'
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'Building a strong Muslim community through education'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Striving for academic and spiritual excellence'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">An-Namuslimah</h1>
                <p className="text-xs text-gray-500">School Management System</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Contact
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Login
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Register
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-3 space-y-3">
              <Link
                to="/"
                className="block py-2 text-gray-600 hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block py-2 text-gray-600 hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block py-2 text-gray-600 hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-3 space-y-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="block w-full text-center px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section (only on home page) */}
      <Outlet context={{ isMobileMenuOpen, setIsMobileMenuOpen }} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About Column */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <School className="h-6 w-6 text-primary-400" />
                <h3 className="text-lg font-semibold">An-Namuslimah</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Dedicated to providing quality Islamic education and Quran memorization.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.LOGIN} className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                    Student Login
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.REGISTER} className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                    Register
                  </Link>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="text-gray-400 text-sm flex items-center gap-2">
                    <ChevronRight size={14} className="text-primary-400" />
                    {feature.title}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: info@anamuslimah.edu</li>
                <li>Phone: +123 456 7890</li>
                <li>Address: Your City, Country</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} An-Namuslimah. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};