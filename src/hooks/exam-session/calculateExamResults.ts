
import { ExamSession, ExamResult } from "@/types/exam-session.types";
import { Exam } from "@/types/exam.types";
import { Question, QuestionType } from "@/types/question.types";
import { v4 as uuidv4 } from "uuid";

export const calculateExamResults = (
  session: ExamSession, 
  exam: Exam, 
  questions: Question[]
): ExamResult => {
  const detailedResults = questions.map(question => {
    const answer = session.answers.find(a => a.questionId === question.id);
    const selectedOptions = answer?.selectedOptions || [];
    
    const correctOptions = question.options
      .filter(o => o.isCorrect)
      .map(o => o.id);
    
    let correct = false;
    
    if (question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.TRUE_FALSE) {
      // For single answer questions, check if the selected option matches one of the correct options
      correct = selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0]);
    } else if (question.type === QuestionType.MULTIPLE_ANSWER) {
      // For multiple answer questions, all correct options must be selected and no incorrect ones
      const allCorrectSelected = correctOptions.every(o => selectedOptions.includes(o));
      const noIncorrectSelected = selectedOptions.every(o => correctOptions.includes(o));
      correct = allCorrectSelected && noIncorrectSelected;
    }
    
    return {
      questionId: question.id,
      correct,
      selectedOptions,
      correctOptions
    };
  });
  
  const correctAnswers = detailedResults.filter(r => r.correct).length;
  const score = (correctAnswers / questions.length) * 100;
  const passed = score >= exam.passingScore;
  const timeTaken = session.completedAt 
    ? Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000)
    : 0;
  
  return {
    id: uuidv4(),
    examSessionId: session.id,
    candidateId: session.candidateId,
    examId: session.examId,
    score,
    passed,
    totalQuestions: questions.length,
    correctAnswers,
    timeTaken,
    submittedAt: session.completedAt || new Date(),
    detailedResults
  };
};
