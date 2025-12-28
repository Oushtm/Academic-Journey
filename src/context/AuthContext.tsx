import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { loadUsers, saveUsers, getCurrentUser, setCurrentUser, clearCurrentUser } from '../services/authStorage';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  signup: (username: string, password: string) => boolean; // Only for first user
  createUser: (username: string, password: string) => boolean; // Admin only
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => getCurrentUser());

  const login = (username: string, password: string): boolean => {
    const users = loadUsers();
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
      setCurrentUser(user);
      setCurrentUserState(user);
      return true;
    }
    return false;
  };

  const signup = (username: string, password: string): boolean => {
    const users = loadUsers();
    
    // Only allow signup if no users exist (first user becomes admin)
    if (users.length > 0) {
      return false; // Signup disabled after first user
    }
    
    // Check if username already exists
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: username.trim(),
      password, // In production, hash this
      createdAt: Date.now(),
      isAdmin: true, // First user is always admin
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    setCurrentUser(newUser);
    setCurrentUserState(newUser);
    return true;
  };
  
  // Admin function to create users (separate from public signup)
  const createUser = (username: string, password: string): boolean => {
    const users = loadUsers();
    
    // Check if username already exists
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: username.trim(),
      password, // In production, hash this
      createdAt: Date.now(),
      isAdmin: false,
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    return true;
  };

  const logout = () => {
    clearCurrentUser();
    setCurrentUserState(null);
  };

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUserState(user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        signup,
        createUser,
        logout,
        isAuthenticated: currentUser !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

