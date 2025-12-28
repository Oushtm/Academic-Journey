import type { Subject, SubjectCalculations } from '../types';

/**
 * Calculate S1 scores and penalties for a subject
 */
export function calculateSubjectScores(subject: Subject): SubjectCalculations {
  const assignment = subject.assignmentScore;
  const exam = subject.examScore;
  
  // Only calculate if both scores are defined
  if (assignment === undefined || exam === undefined) {
    return {
      initialS1Score: 0,
      penalty: subject.missedSessions * 0.2,
      finalS1Score: 0,
    };
  }
  
  // Initial S1 Score = (Assignment + Exam) / 2
  const initialS1Score = (assignment + exam) / 2;
  
  // Penalty = Number of missed sessions × 0.2
  const penalty = subject.missedSessions * 0.2;
  
  // Final S1 Score after penalty = Initial S1 Score - Penalty
  const finalS1Score = Math.max(0, initialS1Score - penalty);
  
  return {
    initialS1Score,
    penalty,
    finalS1Score,
  };
}

