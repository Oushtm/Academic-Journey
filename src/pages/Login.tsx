import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { loadUsers } from '../services/authStorage';

export function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Check if any users exist (if not, allow first user to be admin)
  const users = loadUsers();
  const isFirstUser = users.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isFirstUser) {
      // First user signs up and becomes admin
      const success = signup(username, password);
      if (success) {
        navigate('/');
      } else {
        setError('Failed to create admin account');
      }
    } else {
      // Regular login
      const success = login(username, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-md w-full glass-effect rounded-3xl shadow-2xl p-8 md:p-10 border border-white/50">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Academic Management System
          </h1>
          <p className="text-gray-600">
            {isFirstUser ? 'Create Admin Account' : 'Welcome back!'}
          </p>
          {isFirstUser && (
            <p className="text-sm text-primary-600 font-semibold mt-2">
              First user will be administrator
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 font-semibold text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              👤 Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
              placeholder="Enter your username"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔒 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
          >
            {isFirstUser ? '👑 Create Admin Account' : '🔓 Login'}
          </button>
        </form>

        {!isFirstUser && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Only administrators can create new accounts.
            </p>
            <p className="text-xs text-gray-400">
              Contact your administrator to get an account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

