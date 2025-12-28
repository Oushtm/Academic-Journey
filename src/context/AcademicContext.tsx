import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AcademicYear, Subject, SubjectUserData, Module } from '../types';
import { loadSharedStructure, saveSharedStructure } from '../services/sharedStorage';
import { loadUserData, saveUserData } from '../services/authStorage';
import { useAuth } from './AuthContext';

interface AcademicContextType {
  years: AcademicYear[];
  updateStructure: (years: AcademicYear[]) => void;
  getUserSubjectData: (subjectId: string) => SubjectUserData | undefined;
  updateUserSubjectData: (subjectId: string, data: Partial<SubjectUserData>) => void;
  getSubject: (subjectId: string) => Subject | null;
  getSubjectsForYear: (yearNumber: number) => Array<{ subject: Subject; module: Module }>;
  refreshTrigger: number;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export function AcademicProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [structure, setStructure] = useState(() => loadSharedStructure());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load user data when user changes
  useEffect(() => {
    if (currentUser) {
      // Structure is already loaded, user data will be loaded on demand
      setStructure(loadSharedStructure());
      setRefreshTrigger((prev) => prev + 1); // Trigger refresh
    }
  }, [currentUser]);

  const updateStructure = (years: AcademicYear[]) => {
    const newStructure = { years };
    setStructure(newStructure);
    saveSharedStructure(newStructure);
  };

  const getUserSubjectData = (subjectId: string): SubjectUserData | undefined => {
    if (!currentUser) return undefined;
    const userData = loadUserData(currentUser.id);
    return userData.subjectData[subjectId];
  };

  const updateUserSubjectData = (subjectId: string, data: Partial<SubjectUserData>) => {
    if (!currentUser) return;
    
    const userData = loadUserData(currentUser.id);
    const existing = userData.subjectData[subjectId] || {
      subjectId,
      missedSessions: 0,
      lessons: [],
    };

    userData.subjectData[subjectId] = {
      ...existing,
      ...data,
    };

    saveUserData(userData);
    setRefreshTrigger((prev) => prev + 1); // Trigger refresh to update components
  };

  const getSubject = (subjectId: string): Subject | null => {
    // Use refreshTrigger to ensure we get fresh data when user data changes
    void refreshTrigger;
    
    // Find subject in shared structure
    for (const year of structure.years) {
      for (const module of year.modules) {
        const subjectStruct = module.subjects.find((s) => s.id === subjectId);
        if (subjectStruct) {
          // Merge with user data
          const userData = currentUser ? getUserSubjectData(subjectId) : undefined;
          
          // Convert SubjectStructure to Subject by adding user data
          return {
            ...subjectStruct,
            assignmentScore: userData?.assignmentScore,
            examScore: userData?.examScore,
            missedSessions: userData?.missedSessions ?? 0,
            lessons: userData?.lessons ?? [],
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
        const userData = currentUser ? getUserSubjectData(subjectStruct.id) : undefined;
        result.push({
          subject: {
            ...subjectStruct,
            assignmentScore: userData?.assignmentScore,
            examScore: userData?.examScore,
            missedSessions: userData?.missedSessions ?? 0,
            lessons: userData?.lessons ?? [],
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

