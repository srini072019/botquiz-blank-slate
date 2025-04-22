
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
  timeRemaining?: number;
  isCompleted?: boolean;
  currentQuestionIndex: number;
  expiresAt: Date;
  status: ExamSessionStatus;
  timeTaken?: number;
}

export enum ExamSessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired'
}

export interface ExamSessionState {
  session: ExamSession | null;
  isLoading: boolean;
  error: string | null;
}

export interface ExamSessionActions {
  startExam: (examId: string) => Promise<ExamSession | null>;
  submitAnswer: (questionId: string, selectedOptions: string[]) => void;
  finishExam: () => Promise<boolean>;
  updateTimeRemaining: (timeRemaining: number) => void;
}

export interface ExamAnswer {
  questionId: string;
  selectedOptions: string[];
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
  timeTaken: number;
  submittedAt: Date;
  detailedResults: {
    questionId: string;
    correct: boolean;
    selectedOptions: string[];
    correctOptions: string[];
  }[];
}
