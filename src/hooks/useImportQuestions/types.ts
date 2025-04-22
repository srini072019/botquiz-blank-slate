
import { QuestionFormData } from "@/types/question.types";
import { Subject } from "@/types/subject.types";

export interface ImportQuestionsState {
  isLoading: boolean;
  error: string | null;
  progress: number;
  parsedQuestions: QuestionFormData[];
}

export interface SubjectMatcher {
  findSubjectId: (subjectName: string, subjects: Subject[]) => string | null;
}
