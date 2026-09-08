import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Menu, X, Recycle } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dashboardPath = role === 'recycler' ? '/recycler/dashboard' : '/seller/dashboard';

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-saffron-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-saffron-600 to-saffron-400 flex items-center justify-center text-white shadow-md shadow-saffron-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Kabadiwala <span className="text-saffron-500">Connect</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 -mt-1">
                Digital Scrap Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-sm font-semibold text-gray-700 hover:text-saffron-500 transition-colors"
            >
              Home
            </Link>
            <a
              href="#about"
              className="text-sm font-semibold text-gray-700 hover:text-saffron-500 transition-colors"
            >
              About
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-gray-700 hover:text-saffron-500 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-sm font-semibold text-gray-700 hover:text-saffron-500 transition-colors"
            >
              Features
            </a>
            <a
              href="#contact"
              className="text-sm font-semibold text-gray-700 hover:text-saffron-500 transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(dashboardPath)}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="rounded-full px-5 border-gray-300 hover:border-saffron-400"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/join')}
                  className="rounded-full px-5 shadow-saffron-500/20"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800"
          >
            Home
          </Link>
          <a
            href="#about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800"
          >
            About
          </a>
          <a
            href="#how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800"
          >
            How It Works
          </a>
          <a
            href="#features"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800"
          >
            Features
          </a>
          <a
            href="#contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800"
          >
            Contact
          </a>
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="primary"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(dashboardPath);
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/join');
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

