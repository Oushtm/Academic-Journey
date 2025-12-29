import type { AcademicData, AcademicYear, Module, Subject, Lesson } from '../types';

const STORAGE_KEY = 'academic_data';

/**
 * Load academic data from localStorage
 */
export function loadAcademicData(): AcademicData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading academic data:', error);
  }
  
  // Return default structure with 5 empty years
  return {
    years: Array.from({ length: 5 }, (_, i) => ({
      id: `year-${i + 1}`,
      yearNumber: i + 1,
      semesters: [
        {
          id: `year-${i + 1}-s1`,
          semesterNumber: 1 as 1 | 2,
          modules: [],
        },
        {
          id: `year-${i + 1}-s2`,
          semesterNumber: 2 as 1 | 2,
          modules: [],
        },
      ],
    })),
  };
}

/**
 * Save academic data to localStorage
 */
export function saveAcademicData(data: AcademicData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving academic data:', error);
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Find a subject by ID across all years and modules
 */
export function findSubjectById(
  data: AcademicData,
  subjectId: string
): { year: AcademicYear; module: Module; subject: Subject } | null {
  for (const year of data.years) {
    const modules = year.semesters 
      ? year.semesters.flatMap(s => s.modules)
      : (year.modules || []);
    
    for (const module of modules) {
      const subjectStruct = module.subjects.find((s) => s.id === subjectId);
      if (subjectStruct) {
        // Convert SubjectStructure to Subject by adding default user data
        const subject: Subject = {
          ...subjectStruct,
          missedSessions: 0,
          lessons: [],
        };
        return { year, module, subject };
      }
    }
  }
  return null;
}

/**
 * Update a subject in the data structure
 * @deprecated This function is no longer used with the new multi-user architecture.
 * Use updateStructure from AcademicContext for shared structure updates,
 * and updateUserSubjectData for user-specific data.
 */
export function updateSubject(
  data: AcademicData,
  subjectId: string,
  updates: Partial<Subject>
): AcademicData {
  const newData = { ...data, years: [...data.years] };
  
  for (let yearIndex = 0; yearIndex < newData.years.length; yearIndex++) {
    const year = newData.years[yearIndex];
    const modules = year.semesters 
      ? year.semesters.flatMap((s) => s.modules)
      : (year.modules || []);
    
    const newYear = { ...year, modules: modules };
    
    for (let moduleIndex = 0; moduleIndex < newYear.modules.length; moduleIndex++) {
      const module = newYear.modules[moduleIndex];
      const newModule = { ...module, subjects: [...module.subjects] };
      
      const subjectIndex = newModule.subjects.findIndex((s) => s.id === subjectId);
      if (subjectIndex !== -1) {
        // Only update shared structure fields (name, coefficient)
        const existingSubject = newModule.subjects[subjectIndex];
        newModule.subjects[subjectIndex] = {
          ...existingSubject,
          name: updates.name ?? existingSubject.name,
          coefficient: updates.coefficient ?? existingSubject.coefficient,
        };
        newYear.modules[moduleIndex] = newModule;
        newData.years[yearIndex] = newYear;
        return newData;
      }
      
      newYear.modules[moduleIndex] = newModule;
    }
    
    newData.years[yearIndex] = newYear;
  }
  
  return newData;
}

/**
 * Update a lesson in a subject
 */
export function updateLesson(
  data: AcademicData,
  subjectId: string,
  lessonId: string,
  updates: Partial<Lesson>
): AcademicData {
  const subjectData = findSubjectById(data, subjectId);
  if (!subjectData) return data;
  
  const updatedSubject = {
    ...subjectData.subject,
    lessons: subjectData.subject.lessons.map((lesson) =>
      lesson.id === lessonId ? { ...lesson, ...updates } : lesson
    ),
  };
  
  return updateSubject(data, subjectId, updatedSubject);
}

