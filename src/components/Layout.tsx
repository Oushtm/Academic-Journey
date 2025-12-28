import { Link, useLocation, useNavigate } from 'react-router-dom';
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

  // Don't show header/nav on login page
  if (isLoginPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-4 group animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-white font-bold text-xl">📚</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Academic Management System
                </h1>
                <p className="text-xs text-gray-500 font-medium">EMSI Academic Tracker</p>
              </div>
            </Link>
            <nav className="flex items-center space-x-2 animate-fade-in">
              <Link
                to="/"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  location.pathname === '/'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/50 scale-105'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-primary-600 hover:scale-105'
                }`}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  location.pathname === '/dashboard'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/50 scale-105'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-primary-600 hover:scale-105'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  location.pathname === '/profile'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/50 scale-105'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-primary-600 hover:scale-105'
                }`}
              >
                {currentUser?.isAdmin ? 'Admin' : 'Profile'}
              </Link>
              {currentUser?.isAdmin && (
                <Link
                  to="/users"
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                    location.pathname === '/users'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/50 scale-105'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:text-primary-600 hover:scale-105'
                  }`}
                >
                  👥 Users
                </Link>
              )}
              {currentUser && (
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-300">
                  <span className="text-sm font-semibold text-gray-700">👤 {currentUser.username}</span>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-300 text-sm font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}

