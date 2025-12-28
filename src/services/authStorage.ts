import type { User, UserData } from '../types';

const USERS_STORAGE_KEY = 'academic_users';
const CURRENT_USER_KEY = 'current_user';
const USER_DATA_PREFIX = 'user_data_';

/**
 * Load all users from localStorage
 */
export function loadUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return [];
}

/**
 * Save all users to localStorage
 */
export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

/**
 * Get current logged-in user
 */
export function getCurrentUser(): User | null {
  try {
    const stored = sessionStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  return null;
}

/**
 * Set current logged-in user
 */
export function setCurrentUser(user: User): void {
  try {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error setting current user:', error);
  }
}

/**
 * Clear current user (logout)
 */
export function clearCurrentUser(): void {
  try {
    sessionStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
}

/**
 * Load user-specific data
 */
export function loadUserData(userId: string): UserData {
  try {
    const stored = localStorage.getItem(`${USER_DATA_PREFIX}${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
  
  return {
    userId,
    subjectData: {},
  };
}

/**
 * Save user-specific data
 */
export function saveUserData(userData: UserData): void {
  try {
    localStorage.setItem(`${USER_DATA_PREFIX}${userData.userId}`, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

