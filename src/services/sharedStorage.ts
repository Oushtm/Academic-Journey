import type { AcademicYear } from '../types';

const SHARED_STRUCTURE_KEY = 'shared_academic_structure';

/**
 * Load shared academic structure (same for all users)
 */
export function loadSharedStructure(): { years: AcademicYear[] } {
  try {
    const stored = localStorage.getItem(SHARED_STRUCTURE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading shared structure:', error);
  }
  
  // Return default structure with 5 empty years
  return {
    years: Array.from({ length: 5 }, (_, i) => ({
      id: `year-${i + 1}`,
      yearNumber: i + 1,
      modules: [],
    })),
  };
}

/**
 * Save shared academic structure
 */
export function saveSharedStructure(data: { years: AcademicYear[] }): void {
  try {
    localStorage.setItem(SHARED_STRUCTURE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving shared structure:', error);
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

