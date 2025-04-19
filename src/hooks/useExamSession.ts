
import { useState } from "react";
import { toast } from "sonner";
import { ExamSession, ExamSessionStatus, ExamAnswer, ExamResult } from "@/types/exam-session.types";
import { Exam } from "@/types/exam.types";
import { Question, QuestionType } from "@/types/question.types";
import { v4 as uuidv4 } from "uuid";

// Mock data for now - will be replaced with Supabase integration
const mockExamSessions: ExamSession[] = [];

export const useExamSession = () => {
  const [examSessions, setExamSessions] = useState<ExamSession[]>(mockExamSessions);
  const [isLoading, setIsLoading] = useState(false);

  const startExam = async (examId: string, candidateId: string, timeLimit: number): Promise<ExamSession | undefined> => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with Supabase
      const now = new Date();
      const expiresAt = new Date(now.getTime() + timeLimit * 60 * 1000);
      
      const newExamSession: ExamSession = {
        id: uuidv4(),
        examId,
        candidateId,
        startedAt: now,
        expiresAt,
        answers: [],
        currentQuestionIndex: 0,
        status: ExamSessionStatus.IN_PROGRESS
      };
      
      setExamSessions([...examSessions, newExamSession]);
      toast.success("Exam started successfully");
      return newExamSession;
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Failed to start exam");
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnswer = async (
    sessionId: string, 
    questionId: string, 
    selectedOptions: string[]
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Find the session
      const session = examSessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error("Exam session not found");
      }

      // Update the answer
      let updatedAnswers = [...session.answers];
      const existingAnswerIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
      
      if (existingAnswerIndex >= 0) {
        // Update existing answer
        updatedAnswers[existingAnswerIndex] = {
          ...updatedAnswers[existingAnswerIndex],
          selectedOptions
        };
      } else {
        // Add new answer
        updatedAnswers.push({
          questionId,
          selectedOptions
        });
      }

      // Update the session
      const updatedSession = {
        ...session,
        answers: updatedAnswers
      };

      // Update state
      setExamSessions(examSessions.map(s => 
        s.id === sessionId ? updatedSession : s
      ));

      return true;
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Failed to save your answer");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const navigateQuestion = async (
    sessionId: string,
    newIndex: number
  ): Promise<boolean> => {
    try {
      // Find the session
      const session = examSessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error("Exam session not found");
      }

      // Update the session
      const updatedSession = {
        ...session,
        currentQuestionIndex: newIndex
      };

      // Update state
      setExamSessions(examSessions.map(s => 
        s.id === sessionId ? updatedSession : s
      ));

      return true;
    } catch (error) {
      console.error("Error navigating question:", error);
      toast.error("Failed to navigate to the question");
      return false;
    }
  };

  const calculateResults = (
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

  const submitExam = async (
    sessionId: string,
    exam: Exam,
    questions: Question[]
  ): Promise<ExamResult | undefined> => {
    setIsLoading(true);
    try {
      // Find the session
      const session = examSessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error("Exam session not found");
      }

      // Update the session
      const now = new Date();
      const updatedSession: ExamSession = {
        ...session,
        completedAt: now,
        status: ExamSessionStatus.COMPLETED
      };

      // Calculate results
      const results = calculateResults(updatedSession, exam, questions);
      
      // Update the session with the results
      const finalSession: ExamSession = {
        ...updatedSession,
        score: results.score,
        passed: results.passed,
        timeTaken: results.timeTaken
      };

      // Update state
      setExamSessions(examSessions.map(s => 
        s.id === sessionId ? finalSession : s
      ));

      toast.success("Exam submitted successfully");
      return results;
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam");
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const getExamSession = (id: string): ExamSession | undefined => {
    return examSessions.find(session => session.id === id);
  };

  return {
    examSessions,
    isLoading,
    startExam,
    saveAnswer,
    navigateQuestion,
    submitExam,
    getExamSession
  };
};
