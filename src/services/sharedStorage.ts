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
  // Save to Supabase first (if configured) - this is the primary storage
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
        throw error; // Re-throw to fall through to localStorage
      } else {
        console.log('Successfully saved to Supabase');
        // If Supabase save succeeded, try to save a lightweight version to localStorage (without PDFs)
        try {
          const dataWithoutPdfs = removePdfsFromStructure(data);
          const jsonString = JSON.stringify(dataWithoutPdfs);
          // Check if it's too large (localStorage limit is ~5-10MB)
          if (jsonString.length < 4 * 1024 * 1024) { // 4MB limit for safety
            localStorage.setItem(SHARED_STRUCTURE_KEY, jsonString);
          } else {
            console.warn('Data too large for localStorage, skipping localStorage backup');
          }
        } catch (localError) {
          console.warn('Could not save to localStorage (data too large or quota exceeded), but Supabase save succeeded');
        }
        return; // Success, exit early
      }
    } catch (error) {
      console.error('Error saving shared structure to Supabase:', error);
      // Fall through to localStorage as backup
    }
  }

  // Fallback: Save to localStorage (without PDFs to avoid quota issues)
  try {
    const dataWithoutPdfs = removePdfsFromStructure(data);
    const jsonString = JSON.stringify(dataWithoutPdfs);
    if (jsonString.length < 4 * 1024 * 1024) { // 4MB limit for safety
      localStorage.setItem(SHARED_STRUCTURE_KEY, jsonString);
    } else {
      console.warn('Data too large for localStorage, cannot save backup');
      throw new Error('Data too large for localStorage');
    }
  } catch (error) {
    console.error('Error saving shared structure to localStorage:', error);
    // If both Supabase and localStorage fail, throw the error
    if (!useSupabase()) {
      throw error;
    }
  }
}

/**
 * Remove PDF files from structure to reduce size for localStorage
 */
function removePdfsFromStructure(data: { years: AcademicYear[] }): { years: AcademicYear[] } {
  return {
    years: data.years.map(year => ({
      ...year,
      modules: year.modules.map(module => ({
        ...module,
        subjects: module.subjects.map(subject => ({
          ...subject,
          lessons: subject.lessons?.map(lesson => {
            const { pdfFile, ...lessonWithoutPdf } = lesson;
            return lessonWithoutPdf;
          }) || [],
        })),
      })),
    })),
  };
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

