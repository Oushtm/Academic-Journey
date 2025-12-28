export type ReviewStatus = 'Not Reviewed' | 'In Progress' | 'Reviewed';

export interface Lesson {
  id: string;
  title: string;
  notes: string;
  // Note: reviewStatus is now user-specific (stored in SubjectUserData.lessonReviewStatus)
  youtubeLink?: string; // YouTube video URL
  courseLink?: string; // Other course/resource link
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
  lessons: Lesson[]; // Lessons are shared (added by admin)
}

// User-specific data per subject
export interface SubjectUserData {
  subjectId: string;
  // S1 Grading
  assignmentScore?: number;
  examScore?: number;
  // Attendance (user-specific)
  missedSessions: number;
  // User-specific lesson review status (lessonId -> reviewStatus)
  lessonReviewStatus?: Record<string, ReviewStatus>;
  // Note: Lessons are now in shared structure (SubjectStructure.lessons)
}

export interface Subject extends SubjectStructure {
  // This is for backward compatibility and will be computed
  assignmentScore?: number;
  examScore?: number;
  missedSessions: number;
  lessons: (Lesson & { reviewStatus?: ReviewStatus })[]; // reviewStatus is optional and user-specific
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

