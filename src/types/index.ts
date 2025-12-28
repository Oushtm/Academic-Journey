export type ReviewStatus = 'Not Reviewed' | 'In Progress' | 'Reviewed';

export interface Lesson {
  id: string;
  title: string;
  notes: string;
  reviewStatus: ReviewStatus;
  pdfFile?: {
    name: string;
    data: string; // base64 encoded PDF
    size: number;
  };
}

// Shared structure (same for all users)
export interface SubjectStructure {
  id: string;
  name: string;
  coefficient?: number;
}

// User-specific data per subject
export interface SubjectUserData {
  subjectId: string;
  // S1 Grading
  assignmentScore?: number;
  examScore?: number;
  // Attendance (user-specific)
  missedSessions: number;
  // Lessons (user-specific notes)
  lessons: Lesson[];
}

export interface Subject extends SubjectStructure {
  // This is for backward compatibility and will be computed
  assignmentScore?: number;
  examScore?: number;
  missedSessions: number;
  lessons: Lesson[];
}

export interface User {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  createdAt: number;
  isAdmin?: boolean;
}

export interface UserData {
  userId: string;
  subjectData: Record<string, SubjectUserData>; // subjectId -> user data
}

export interface Module {
  id: string;
  name: string;
  subjects: SubjectStructure[]; // Shared structure only
}

export interface AcademicYear {
  id: string;
  yearNumber: number; // 1-5
  modules: Module[];
}

export interface AcademicData {
  years: AcademicYear[];
}

// Calculated values for display
export interface SubjectCalculations {
  initialS1Score: number;
  penalty: number;
  finalS1Score: number;
}

