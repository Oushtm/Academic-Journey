import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AcademicYear, Subject, SubjectUserData, Module, UserData, Lesson, ReviewStatus } from '../types';
import { loadSharedStructure, saveSharedStructure } from '../services/sharedStorage';
import { loadUserData, saveUserData } from '../services/authStorage';
import { useAuth } from './AuthContext';

const defaultStructure = {
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

interface AcademicContextType {
  years: AcademicYear[];
  updateStructure: (years: AcademicYear[]) => void;
  getUserSubjectData: (subjectId: string) => SubjectUserData | undefined;
  updateUserSubjectData: (subjectId: string, data: Partial<SubjectUserData>) => Promise<void>;
  updateSubjectLessons: (subjectId: string, lessons: Lesson[]) => Promise<void>;
  updateLessonReviewStatus: (subjectId: string, lessonId: string, reviewStatus: ReviewStatus) => Promise<void>;
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

  // Migrate old structure to new semester-based structure
  const migrateToSemesters = (years: AcademicYear[]): AcademicYear[] => {
    return years.map(year => {
      // If year already has semesters, return as is
      if (year.semesters && year.semesters.length > 0) {
        return year;
      }
      
      // If year has old modules structure, migrate to S1
      if (year.modules && year.modules.length > 0) {
        return {
          ...year,
          semesters: [
            {
              id: `year-${year.yearNumber}-s1`,
              semesterNumber: 1 as 1 | 2,
              modules: year.modules, // Move existing modules to S1
            },
            {
              id: `year-${year.yearNumber}-s2`,
              semesterNumber: 2 as 1 | 2,
              modules: [],
            },
          ],
        };
      }
      
      // If year has no modules, create empty semesters
      return {
        ...year,
        semesters: [
          {
            id: `year-${year.yearNumber}-s1`,
            semesterNumber: 1 as 1 | 2,
            modules: [],
          },
          {
            id: `year-${year.yearNumber}-s2`,
            semesterNumber: 2 as 1 | 2,
            modules: [],
          },
        ],
      };
    });
  };

  // Load structure on mount
  useEffect(() => {
    loadSharedStructure().then((loadedStructure) => {
      const migratedStructure = {
        years: migrateToSemesters(loadedStructure.years),
      };
      setStructure(migratedStructure);
      // Save migrated structure
      saveSharedStructure(migratedStructure);
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

  // Update user's review status for a lesson (all users can do this)
  const updateLessonReviewStatus = async (subjectId: string, lessonId: string, reviewStatus: ReviewStatus) => {
    if (!currentUser) return;
    
    const currentData = userDataCache[currentUser.id] || {
      userId: currentUser.id,
      subjectData: {},
    };
    
    const existing = currentData.subjectData[subjectId] || {
      subjectId,
      missedSessions: 0,
      lessonReviewStatus: {},
    };

    const updatedData = {
      ...currentData,
      subjectData: {
        ...currentData.subjectData,
        [subjectId]: {
          ...existing,
          lessonReviewStatus: {
            ...existing.lessonReviewStatus,
            [lessonId]: reviewStatus,
          },
        },
      },
    };

    // Update cache immediately for UI responsiveness
    setUserDataCache({ ...userDataCache, [currentUser.id]: updatedData });
    
    // Save to Supabase/localStorage
    try {
      await saveUserData(updatedData);
      console.log('Successfully saved lesson review status for', lessonId);
    } catch (error) {
      console.error('Error saving lesson review status:', error);
    }
    
    setRefreshTrigger((prev) => prev + 1);
  };

  // Update lessons in shared structure (admin only)
  const updateSubjectLessons = async (subjectId: string, lessons: Lesson[]) => {
    // First, ensure we have the latest structure from storage to avoid data loss
    const currentStructure = await loadSharedStructure();
    
    // Verify the structure has data before proceeding
    if (!currentStructure.years || currentStructure.years.length === 0) {
      console.error('Cannot update lessons: structure is empty or not loaded');
      throw new Error('Structure not loaded');
    }

    const newYears = currentStructure.years.map((year) => {
      // Handle new semester structure
      if (year.semesters) {
        return {
          ...year,
          semesters: year.semesters.map((semester) => ({
            ...semester,
            modules: semester.modules.map((module) => ({
              ...module,
              subjects: module.subjects.map((subject) =>
                subject.id === subjectId ? { ...subject, lessons } : subject
              ),
            })),
          })),
        };
      }
      // Handle old module structure
      return {
        ...year,
        modules: year.modules?.map((module) => ({
          ...module,
          subjects: module.subjects.map((subject) =>
            subject.id === subjectId ? { ...subject, lessons } : subject
          ),
        })) || [],
      };
    });

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
      // On error, reload from storage to ensure consistency
      const reloadedStructure = await loadSharedStructure();
      setStructure(reloadedStructure);
      setRefreshTrigger((prev) => prev + 1);
      throw error; // Re-throw so caller knows it failed
    }
  };

  const getSubject = (subjectId: string): Subject | null => {
    void refreshTrigger; // Use to trigger re-render when data changes
    
    // Find subject in shared structure (support both old and new structure)
    for (const year of structure.years) {
      // Check semesters (new structure)
      if (year.semesters) {
        for (const semester of year.semesters) {
          for (const module of semester.modules) {
            const subjectStruct = module.subjects.find((s) => s.id === subjectId);
            if (subjectStruct) {
              const userData = getUserSubjectData(subjectId);
              const lessonsWithUserStatus = (subjectStruct.lessons || []).map(lesson => ({
                ...lesson,
                reviewStatus: userData?.lessonReviewStatus?.[lesson.id] as ReviewStatus | undefined,
              }));

              return {
                ...subjectStruct,
                assignmentScore: userData?.assignmentScore,
                examScore: userData?.examScore,
                missedSessions: userData?.missedSessions ?? 0,
                lessons: lessonsWithUserStatus,
              };
            }
          }
        }
      }
      // Check old modules structure (backward compatibility)
      if (year.modules) {
        for (const module of year.modules) {
          const subjectStruct = module.subjects.find((s) => s.id === subjectId);
          if (subjectStruct) {
            const userData = getUserSubjectData(subjectId);
            const lessonsWithUserStatus = (subjectStruct.lessons || []).map(lesson => ({
              ...lesson,
              reviewStatus: userData?.lessonReviewStatus?.[lesson.id] as ReviewStatus | undefined,
            }));

            return {
              ...subjectStruct,
              assignmentScore: userData?.assignmentScore,
              examScore: userData?.examScore,
              missedSessions: userData?.missedSessions ?? 0,
              lessons: lessonsWithUserStatus,
            };
          }
        }
      }
    }
    return null;
  };

  const getSubjectsForYear = (yearNumber: number): Array<{ subject: Subject; module: Module }> => {
    void refreshTrigger; // Use to trigger re-render when data changes
    
    const year = structure.years.find((y) => y.yearNumber === yearNumber);
    if (!year) return [];

    const result: Array<{ subject: Subject; module: Module }> = [];
    
    // Check semesters (new structure)
    if (year.semesters) {
      for (const semester of year.semesters) {
        for (const module of semester.modules) {
          for (const subjectStruct of module.subjects) {
            const subject = getSubject(subjectStruct.id);
            if (subject) {
              result.push({ subject, module });
            }
          }
        }
      }
    }
    // Check old modules structure (backward compatibility)
    else if (year.modules) {
      for (const module of year.modules) {
        for (const subjectStruct of module.subjects) {
          const subject = getSubject(subjectStruct.id);
          if (subject) {
            result.push({ subject, module });
          }
        }
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
        updateLessonReviewStatus,
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
