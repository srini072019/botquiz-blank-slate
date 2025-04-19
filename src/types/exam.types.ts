import { QuestionPool } from "./question-pool.types";
import { Question } from "./question.types";

export enum ExamStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived"
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  courseId: string;
  instructorId: string;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  shuffleQuestions: boolean;
  status: ExamStatus;
  questions: string[]; // Question IDs
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  useQuestionPool?: boolean;
  questionPool?: QuestionPool;
}

export interface ExamFormData {
  title: string;
  description: string;
  courseId: string;
  timeLimit: number;
  passingScore: number;
  shuffleQuestions: boolean;
  status: ExamStatus;
  questions: string[];
  startDate?: Date;
  endDate?: Date;
  startTime: string;
  endTime: string;
  useQuestionPool: boolean; // Changed from optional to required
  questionPool?: QuestionPool;
}

export interface ExamSession {
  id: string;
  examId: string;
  candidateId: string;
  startedAt: Date;
  completedAt?: Date;
  answers: {
    questionId: string;
    selectedOptions: string[];
  }[];
  score?: number;
  passed?: boolean;
}
