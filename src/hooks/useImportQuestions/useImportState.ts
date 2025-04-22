
import { useState } from "react";
import { ImportQuestionsState } from "./types";
import { QuestionFormData } from "@/types/question.types";

export const useImportState = () => {
  const [state, setState] = useState<ImportQuestionsState>({
    isLoading: false,
    error: null,
    progress: 0,
    parsedQuestions: []
  });

  const resetState = () => {
    setState({
      isLoading: false,
      error: null,
      progress: 0,
      parsedQuestions: []
    });
  };

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setProgress = (progress: number) => {
    setState(prev => ({ ...prev, progress }));
  };

  const setParsedQuestions = (questions: QuestionFormData[]) => {
    setState(prev => ({ ...prev, parsedQuestions: questions }));
  };

  return {
    ...state,
    resetState,
    setLoading,
    setError,
    setProgress,
    setParsedQuestions
  };
};
