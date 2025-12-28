import type { AcademicYear } from '../types';
import { supabase, useSupabase } from '../lib/supabase';

const SHARED_STRUCTURE_KEY = 'shared_academic_structure';

const defaultStructure = {
  years: Array.from({ length: 5 }, (_, i) => ({
    id: `year-${i + 1}`,
    yearNumber: i + 1,
    modules: [],
  })),
};

/**
 * Load shared academic structure from Supabase (if configured) or localStorage
 */
export async function loadSharedStructure(): Promise<{ years: AcademicYear[] }> {
  // Try Supabase first if configured
  if (useSupabase()) {
    try {
      const { data, error } = await supabase!
        .from('shared_structure')
        .select('data')
        .eq('id', 'main')
        .single();

      if (error) {
        console.error('Error loading shared structure from Supabase:', error);
        // If table doesn't exist (404), fall back to localStorage
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Shared structure table does not exist yet. Please run the SQL script in Supabase.');
        }
      } else if (data) {
        const structure = data.data as { years: AcademicYear[] };
        // Also save to localStorage as backup
        localStorage.setItem(SHARED_STRUCTURE_KEY, JSON.stringify(structure));
        return structure;
      }
    } catch (error) {
      console.error('Error loading shared structure from Supabase:', error);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(SHARED_STRUCTURE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading shared structure from localStorage:', error);
  }
  
  // Return default structure
  return defaultStructure;
}

/**
 * Save shared academic structure to Supabase (if configured) and localStorage
 */
export async function saveSharedStructure(data: { years: AcademicYear[] }): Promise<void> {
  // Always save to localStorage as backup
  try {
    localStorage.setItem(SHARED_STRUCTURE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving shared structure to localStorage:', error);
  }

  // Save to Supabase if configured
  if (useSupabase()) {
    try {
      const { error } = await supabase!
        .from('shared_structure')
        .upsert({
          id: 'main',
          data: data,
          updated_at: Date.now(),
        }, {
          onConflict: 'id',
        });

      if (error) {
        console.error('Error saving shared structure to Supabase:', error);
      }
    } catch (error) {
      console.error('Error saving shared structure to Supabase:', error);
    }
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

