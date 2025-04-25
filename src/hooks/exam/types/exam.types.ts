
import { Exam, ExamStatus } from "@/types/exam.types";
import { Question } from "@/types/question.types";

export interface UseExamResult {
  exam: Exam | null;
  examQuestions: Question[];
  isLoading: boolean;
  error: string | null;
}

export interface ExamData {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  instructor_id: string;
  time_limit: number;
  passing_score: number;
  shuffle_questions: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  start_date: string | null;
  end_date: string | null;
  use_question_pool: boolean | null;
  question_pool: any | null; // Changed from string to any to accommodate JSON type
}
