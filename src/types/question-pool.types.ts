
import { DifficultyLevel } from "./question.types";

export interface SubjectPoolItem {
  subjectId: string;
  count: number;
  difficultyLevels?: {
    [key in DifficultyLevel]?: number;
  };
}

export interface QuestionPool {
  totalQuestions: number;
  subjects: SubjectPoolItem[];
}
