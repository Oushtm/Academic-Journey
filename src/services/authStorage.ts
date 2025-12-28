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
          // Fall through to localStorage
        } else {
          // For other errors, still try localStorage
          console.warn('Failed to load from Supabase, trying localStorage...');
        }
      } else if (data !== null && data !== undefined) {
        // Map Supabase column names back to User type (snake_case to camelCase)
        const users = data.map((row: any) => ({
          id: row.id,
          username: row.username,
          password: row.password,
          createdAt: row.created_at, // Map created_at to createdAt
          isAdmin: row.is_admin ?? false, // Map is_admin to isAdmin
        }));
        
        // Save to localStorage as backup
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        console.log(`Loaded ${users.length} users from Supabase`);
        return users;
      } else {
        console.warn('No data returned from Supabase, trying localStorage...');
      }
    } catch (error) {
      console.error('Error loading users from Supabase:', error);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      const users = JSON.parse(stored);
      console.log(`Loaded ${users.length} users from localStorage`);
      return users;
    }
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
  }
  
  console.log('No users found in Supabase or localStorage');
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
      // Delete all existing users first
      const { error: deleteError } = await supabase!.from('users').delete().neq('id', '');
      
      if (deleteError && deleteError.code !== 'PGRST116') {
        console.error('Error deleting users from Supabase:', deleteError);
        // Continue anyway - maybe table is empty
      }
      
      if (users.length > 0) {
        // Map User type to Supabase column names (camelCase to snake_case)
        const usersForSupabase = users.map(user => ({
          id: user.id,
          username: user.username,
          password: user.password,
          created_at: user.createdAt, // Map createdAt to created_at
          is_admin: user.isAdmin ?? false, // Map isAdmin to is_admin
        }));
        
        const { data, error } = await supabase!.from('users').insert(usersForSupabase).select();
        
        if (error) {
          console.error('Error saving users to Supabase:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
            console.warn('Users table does not exist yet. Please run the SQL script in Supabase.');
          }
        } else {
          console.log(`Successfully saved ${users.length} users to Supabase`);
          if (data) {
            console.log('Saved users:', data);
          }
        }
      } else {
        console.log('No users to save to Supabase (empty array)');
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

