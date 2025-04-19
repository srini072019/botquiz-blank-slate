
import { Exam } from "./exam.types";
import { Question } from "./question.types";

export enum ExamSessionStatus {
  IN_PROGRESS = "inProgress",
  COMPLETED = "completed",
  EXPIRED = "expired"
}

export interface ExamAnswer {
  questionId: string;
  selectedOptions: string[];
}

export interface ExamSession {
  id: string;
  examId: string;
  candidateId: string;
  startedAt: Date;
  completedAt?: Date;
  expiresAt: Date;
  answers: ExamAnswer[];
  currentQuestionIndex: number;
  status: ExamSessionStatus;
  score?: number;
  passed?: boolean;
  timeTaken?: number; // in seconds
}

export interface ExamSessionWithDetails extends ExamSession {
  exam: Exam;
  questions: Question[];
}

export interface ExamResult {
  id: string;
  examSessionId: string;
  candidateId: string;
  examId: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  submittedAt: Date;
  feedback?: string;
  detailedResults: {
    questionId: string;
    correct: boolean;
    selectedOptions: string[];
    correctOptions: string[];
  }[];
}

export interface ExamSessionFormData {
  answers: ExamAnswer[];
}
