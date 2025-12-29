import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show header/nav on login page
  if (isLoginPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect shadow-lg border-b border-gray-200/50 sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20 min-h-[56px]">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 group animate-fade-in flex-shrink-0 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-white font-bold text-base sm:text-lg md:text-xl">📚</span>
                </div>
              </div>
              <div className="min-w-0 flex-1 sm:flex-none">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent truncate">
                  Academic Management System
                </h1>
                <p className="hidden sm:block text-xs text-gray-500 font-medium truncate">EMSI Academic Tracker</p>
              </div>
            </Link>
            
            {/* Desktop Navigation - Hidden on mobile and tablet */}
            <nav className="hidden xl:flex items-center space-x-2 animate-fade-in">
              <Link
                to="/"
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  location.pathname === '/'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/50 scale-105'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-primary-600 hover:scale-105'
                }`}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  location.pathname === '/dashboard'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/50 scale-105'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-primary-600 hover:scale-105'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  location.pathname === '/profile'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/50 scale-105'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-primary-600 hover:scale-105'
                }`}
              >
                {currentUser?.isAdmin ? 'Admin' : 'Profile'}
              </Link>
              <Link
                to="/schedule"
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  location.pathname === '/schedule'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/50 scale-105'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-primary-600 hover:scale-105'
                }`}
              >
                📅 Schedule
              </Link>
              {currentUser?.isAdmin && (
                <Link
                  to="/users"
                  className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                    location.pathname === '/users'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/50 scale-105'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:text-primary-600 hover:scale-105'
                  }`}
                >
                  👥 Users
                </Link>
              )}
              {currentUser && (
                <div className="flex items-center space-x-2 md:space-x-3 ml-2 md:ml-4 pl-2 md:pl-4 border-l border-gray-300">
                  <span className="text-xs md:text-sm font-semibold text-gray-700 hidden xl:inline">👤 {currentUser.username}</span>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-300 text-xs md:text-sm font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button - Show on screens smaller than xl */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu - Show on screens smaller than xl */}
          {mobileMenuOpen && (
            <div className="xl:hidden py-3 sm:py-4 border-t border-gray-200 animate-fade-in">
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    location.pathname === '/'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    location.pathname === '/dashboard'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    location.pathname === '/profile'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {currentUser?.isAdmin ? 'Admin' : 'Profile'}
                </Link>
                <Link
                  to="/schedule"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    location.pathname === '/schedule'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📅 Schedule
                </Link>
                {currentUser?.isAdmin && (
                  <Link
                    to="/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      location.pathname === '/users'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    👥 Users
                  </Link>
                )}
                {currentUser && (
                  <div className="pt-2 border-t border-gray-200 space-y-2">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-700">
                      👤 {currentUser.username}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-300 text-sm font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}

