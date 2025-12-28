import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadUsers, saveUsers } from '../services/authStorage';
import type { User } from '../types';

export function UserManagement() {
  const { currentUser, createUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load users on mount and when they change
  useEffect(() => {
    setUsers(loadUsers());
  }, []);

  // Only admin can access this page
  if (!currentUser?.isAdmin) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">Only administrators can access this page.</p>
        <Link 
          to="/" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
        >
          ← Return to Home
        </Link>
      </div>
    );
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Use createUser from AuthContext (admin-only function)
    const success = createUser(newUsername.trim(), newPassword);
    if (success) {
      // Reload users list
      setUsers(loadUsers());
      setNewUsername('');
      setNewPassword('');
      setShowCreateForm(false);
      setSuccess(`User "${newUsername.trim()}" created successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Username already exists');
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (userId === currentUser.id) {
      alert('You cannot delete your own account!');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    const updatedUsers = users.filter((u) => u.id !== userId);
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    setSuccess(`User "${username}" deleted successfully!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 space-y-4">
          <Link to="/profile" className="text-white/80 hover:text-white text-sm inline-block font-medium hover:underline">
            ← Back to Profile
          </Link>
          <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold border border-white/30">
            👥 User Management
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-extrabold">User Management</h2>
            <p className="text-xl text-primary-100">Create and manage user accounts • Admin only</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-red-700 font-semibold text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <p className="text-green-700 font-semibold text-sm">{success}</p>
        </div>
      )}

      {/* Create User Button */}
      {!showCreateForm ? (
        <div className="glass-effect rounded-2xl shadow-medium border border-white/50 p-8">
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
          >
            ➕ Create New User Account
          </button>
        </div>
      ) : (
        <div className="glass-effect rounded-2xl shadow-medium border border-white/50 p-8">
          <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Create New User</h3>
          <form onSubmit={handleCreateUser} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                👤 Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                placeholder="Enter username"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                🔒 Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                placeholder="Enter password"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105"
              >
                ✓ Create User
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewUsername('');
                  setNewPassword('');
                  setError('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 text-sm font-bold hover:shadow-md"
              >
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="glass-effect rounded-2xl shadow-medium border border-white/50 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-primary-800 rounded-full"></div>
          <h3 className="text-2xl font-extrabold text-gray-900">All Users ({users.length})</h3>
        </div>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    user.isAdmin 
                      ? 'bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300' 
                      : 'bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300'
                  }`}>
                    <span className="text-2xl">{user.isAdmin ? '👑' : '👤'}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="text-xl font-bold text-gray-900">{user.username}</h4>
                      {user.isAdmin && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold border border-purple-300">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {!user.isAdmin && (
                  <button
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:shadow-md transition-all duration-300 text-sm font-semibold"
                  >
                    🗑️ Delete
                  </button>
                )}
                {user.isAdmin && (
                  <span className="text-sm text-gray-400 font-medium">Cannot delete admin</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

