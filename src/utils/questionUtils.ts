
import { QuestionType, DifficultyLevel } from "@/types/question.types";

/**
 * Maps a string value from the database to the QuestionType enum
 */
export const mapToQuestionType = (typeString: string): QuestionType => {
  switch (typeString) {
    case "multiple_choice":
      return QuestionType.MULTIPLE_CHOICE;
    case "true_false":
      return QuestionType.TRUE_FALSE;
    case "multiple_answer":
      return QuestionType.MULTIPLE_ANSWER;
    default:
      // Default to MULTIPLE_CHOICE if type is not recognized
      console.warn(`Unrecognized question type: ${typeString}`);
      return QuestionType.MULTIPLE_CHOICE;
  }
};

/**
 * Maps a string value from the database to the DifficultyLevel enum
 */
export const mapToDifficultyLevel = (levelString: string): DifficultyLevel => {
  switch (levelString) {
    case "easy":
      return DifficultyLevel.EASY;
    case "medium":
      return DifficultyLevel.MEDIUM;
    case "hard":
      return DifficultyLevel.HARD;
    default:
      // Default to MEDIUM if level is not recognized
      console.warn(`Unrecognized difficulty level: ${levelString}`);
      return DifficultyLevel.MEDIUM;
  }
};

/**
 * Formats question type for display
 */
export const formatQuestionType = (type: QuestionType): string => {
  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return "Multiple Choice";
    case QuestionType.TRUE_FALSE:
      return "True/False";
    case QuestionType.MULTIPLE_ANSWER:
      return "Multiple Answer";
    default:
      return "Unknown";
  }
};

/**
 * Get color class for difficulty badge
 */
export const getDifficultyColor = (level: DifficultyLevel): string => {
  switch (level) {
    case DifficultyLevel.EASY:
      return "bg-green-100 text-green-800";
    case DifficultyLevel.MEDIUM:
      return "bg-yellow-100 text-yellow-800";
    case DifficultyLevel.HARD:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
