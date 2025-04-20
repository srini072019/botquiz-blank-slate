
import { useState } from "react";
import { ExamSession } from "@/types/exam-session.types";

// Mock data for now - will be replaced with Supabase integration
const mockExamSessions: ExamSession[] = [];

export const useExamSessionState = () => {
  const [examSessions, setExamSessions] = useState<ExamSession[]>(mockExamSessions);
  
  return {
    examSessions,
    setExamSessions
  };
};
