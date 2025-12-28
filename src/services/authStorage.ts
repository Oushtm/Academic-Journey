import type { User, UserData } from '../types';
import { supabase, useSupabase } from '../lib/supabase';

const USERS_STORAGE_KEY = 'academic_users';
const CURRENT_USER_KEY = 'current_user';
const USER_DATA_PREFIX = 'user_data_';

/**
 * Load all users from Supabase (if configured) or localStorage
 */
export async function loadUsers(): Promise<User[]> {
  // Try Supabase first if configured
  if (useSupabase()) {
    try {
      const { data, error } = await supabase!
        .from('users')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading users from Supabase:', error);
        // If table doesn't exist (404), fall back to localStorage
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Users table does not exist yet. Please run the SQL script in Supabase.');
          return [];
        }
      } else if (data) {
        // Also save to localStorage as backup
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error('Error loading users from Supabase:', error);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
  }
  return [];
}

/**
 * Save all users to Supabase (if configured) and localStorage
 */
export async function saveUsers(users: User[]): Promise<void> {
  // Always save to localStorage as backup
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }

  // Save to Supabase if configured
  if (useSupabase()) {
    try {
      // Delete all and insert (simple approach)
      await supabase!.from('users').delete().neq('id', '');
      
      if (users.length > 0) {
        const { error } = await supabase!.from('users').insert(users);
        if (error) {
          console.error('Error saving users to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error saving users to Supabase:', error);
    }
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
 * Load user-specific data from Supabase (if configured) or localStorage
 */
export async function loadUserData(userId: string): Promise<UserData> {
  // Try Supabase first if configured
  if (useSupabase()) {
    try {
      const { data, error } = await supabase!
        .from('user_data')
        .select('subject_data')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading user data from Supabase:', error);
        // If table doesn't exist (404), fall back to localStorage
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('User data table does not exist yet. Please run the SQL script in Supabase.');
        }
      } else if (data) {
        const userData = {
          userId,
          subjectData: data.subject_data || {},
        };
        // Also save to localStorage as backup
        localStorage.setItem(`${USER_DATA_PREFIX}${userId}`, JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error('Error loading user data from Supabase:', error);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(`${USER_DATA_PREFIX}${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading user data from localStorage:', error);
  }
  
  return {
    userId,
    subjectData: {},
  };
}

/**
 * Save user-specific data to Supabase (if configured) and localStorage
 */
export async function saveUserData(userData: UserData): Promise<void> {
  // Always save to localStorage as backup
  try {
    localStorage.setItem(`${USER_DATA_PREFIX}${userData.userId}`, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data to localStorage:', error);
  }

  // Save to Supabase if configured
  if (useSupabase()) {
    try {
      const { error } = await supabase!
        .from('user_data')
        .upsert({
          id: `user_data_${userData.userId}`,
          user_id: userData.userId,
          subject_data: userData.subjectData,
          updated_at: Date.now(),
        }, {
          onConflict: 'id',
        });

      if (error) {
        console.error('Error saving user data to Supabase:', error);
      }
    } catch (error) {
      console.error('Error saving user data to Supabase:', error);
    }
  }
}

