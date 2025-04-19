
import { QuestionOption, QuestionType } from "@/types/question.types";

export const parseOptions = (
  optionsArray: string[], 
  correctAnswers: string, 
  type: QuestionType
): QuestionOption[] => {
  // For true/false, ensure we have only 'true' and 'false' options
  if (type === QuestionType.TRUE_FALSE) {
    return [
      { id: crypto.randomUUID(), text: "True", isCorrect: correctAnswers.toLowerCase().includes("true") || correctAnswers.includes("A") || correctAnswers.includes("1") },
      { id: crypto.randomUUID(), text: "False", isCorrect: correctAnswers.toLowerCase().includes("false") || correctAnswers.includes("B") || correctAnswers.includes("2") }
    ];
  }

  // For other question types, parse the options and mark correct ones based on the correct option letters/numbers
  const correctOptionLetters = correctAnswers
    .split(/[,;\s]/)
    .map(answer => answer.trim().toUpperCase())
    .filter(answer => answer.length > 0);

  return optionsArray
    .filter(option => option !== "")
    .map((option, index) => {
      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
      const optionNumber = String(index + 1); // 1, 2, 3, 4...
      
      const isCorrect = correctOptionLetters.includes(optionLetter) || 
                        correctOptionLetters.includes(optionNumber);

      return {
        id: crypto.randomUUID(),
        text: option,
        isCorrect
      };
    });
};
