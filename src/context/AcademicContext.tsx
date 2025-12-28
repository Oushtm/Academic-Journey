import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AcademicYear, Subject, SubjectUserData, Module, UserData, Lesson } from '../types';
import { loadSharedStructure, saveSharedStructure } from '../services/sharedStorage';
import { loadUserData, saveUserData } from '../services/authStorage';
import { useAuth } from './AuthContext';

const defaultStructure = {
  years: Array.from({ length: 5 }, (_, i) => ({
    id: `year-${i + 1}`,
    yearNumber: i + 1,
    modules: [],
  })),
};

interface AcademicContextType {
  years: AcademicYear[];
  updateStructure: (years: AcademicYear[]) => void;
  getUserSubjectData: (subjectId: string) => SubjectUserData | undefined;
  updateUserSubjectData: (subjectId: string, data: Partial<SubjectUserData>) => Promise<void>;
  updateSubjectLessons: (subjectId: string, lessons: Lesson[]) => Promise<void>;
  getSubject: (subjectId: string) => Subject | null;
  getSubjectsForYear: (yearNumber: number) => Array<{ subject: Subject; module: Module }>;
  refreshTrigger: number;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export function AcademicProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [structure, setStructure] = useState<{ years: AcademicYear[] }>(defaultStructure);
  const [userDataCache, setUserDataCache] = useState<Record<string, UserData>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load structure on mount
  useEffect(() => {
    loadSharedStructure().then((loadedStructure) => {
      setStructure(loadedStructure);
    });
  }, []);

  // Load user data cache when user changes
  useEffect(() => {
    if (currentUser) {
      // Load all user data into cache
      loadUserData(currentUser.id).then((data) => {
        setUserDataCache({ [currentUser.id]: data });
      });
      // Reload structure to get latest
      loadSharedStructure().then(setStructure);
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [currentUser]);

  const updateStructure = (years: AcademicYear[]) => {
    const newStructure = { years };
    setStructure(newStructure);
    // Save async in background
    saveSharedStructure(newStructure).catch(console.error);
  };

  const getUserSubjectData = (subjectId: string): SubjectUserData | undefined => {
    if (!currentUser) return undefined;
    const userData = userDataCache[currentUser.id];
    return userData?.subjectData[subjectId];
  };

  const updateUserSubjectData = async (subjectId: string, data: Partial<SubjectUserData>) => {
    if (!currentUser) return;
    
    const currentData = userDataCache[currentUser.id] || {
      userId: currentUser.id,
      subjectData: {},
    };
    
    const existing = currentData.subjectData[subjectId] || {
      subjectId,
      missedSessions: 0,
    };

    const updatedData = {
      ...currentData,
      subjectData: {
        ...currentData.subjectData,
        [subjectId]: {
          ...existing,
          ...data,
        },
      },
    };

    // Update cache immediately for UI responsiveness
    setUserDataCache({ ...userDataCache, [currentUser.id]: updatedData });
    
    // Save to Supabase/localStorage and wait for completion
    try {
      await saveUserData(updatedData);
      console.log('Successfully saved user subject data for', subjectId);
    } catch (error) {
      console.error('Error saving user subject data:', error);
      // Revert cache update on error?
      // For now, we'll keep the optimistic update
    }
    
    setRefreshTrigger((prev) => prev + 1);
  };

  // Update lessons in shared structure (admin only)
  const updateSubjectLessons = async (subjectId: string, lessons: Lesson[]) => {
    const newYears = structure.years.map((year) => ({
      ...year,
      modules: year.modules.map((module) => ({
        ...module,
        subjects: module.subjects.map((subject) =>
          subject.id === subjectId ? { ...subject, lessons } : subject
        ),
      })),
    }));

    const newStructure = { years: newYears };
    
    // Save to Supabase/localStorage first
    try {
      await saveSharedStructure(newStructure);
      console.log('Successfully saved lessons for subject', subjectId);
      // Update state after successful save
      setStructure(newStructure);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Error saving lessons:', error);
      // On error, still update state for optimistic UI, but try to reload from storage
      setStructure(newStructure);
      setRefreshTrigger((prev) => prev + 1);
      // Reload from storage to ensure consistency
      loadSharedStructure().then((loadedStructure) => {
        setStructure(loadedStructure);
        setRefreshTrigger((prev) => prev + 1);
      });
    }
  };

  const getSubject = (subjectId: string): Subject | null => {
    void refreshTrigger; // Use to trigger re-render when data changes
    
    // Find subject in shared structure
    for (const year of structure.years) {
      for (const module of year.modules) {
        const subjectStruct = module.subjects.find((s) => s.id === subjectId);
        if (subjectStruct) {
          // Merge with user data from cache
          const userData = getUserSubjectData(subjectId);
          
          return {
            ...subjectStruct,
            assignmentScore: userData?.assignmentScore,
            examScore: userData?.examScore,
            missedSessions: userData?.missedSessions ?? 0,
            lessons: subjectStruct.lessons || [],
          };
        }
      }
    }
    return null;
  };

  const getSubjectsForYear = (yearNumber: number): Array<{ subject: Subject; module: Module }> => {
    const year = structure.years.find((y) => y.yearNumber === yearNumber);
    if (!year) return [];
    
    const result: Array<{ subject: Subject; module: Module }> = [];
    for (const module of year.modules) {
      for (const subjectStruct of module.subjects) {
        const userData = getUserSubjectData(subjectStruct.id);
        result.push({
          subject: {
            ...subjectStruct,
            assignmentScore: userData?.assignmentScore,
            examScore: userData?.examScore,
            missedSessions: userData?.missedSessions ?? 0,
            lessons: subjectStruct.lessons || [],
          },
          module,
        });
      }
    }
    return result;
  };

  return (
    <AcademicContext.Provider
      value={{
        years: structure.years,
        updateStructure,
        getUserSubjectData,
        updateUserSubjectData,
        updateSubjectLessons,
        getSubject,
        getSubjectsForYear,
        refreshTrigger,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const context = useContext(AcademicContext);
  if (context === undefined) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
}
