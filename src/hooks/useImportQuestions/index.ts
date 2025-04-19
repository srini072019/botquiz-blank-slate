
import { useState } from "react";
import { toast } from "sonner";
import { read, utils, writeFileXLSX } from "xlsx";
import { QuestionFormData, QuestionType, DifficultyLevel } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import { mapToQuestionType, mapToDifficultyLevel } from "@/utils/questionUtils";
import { parseFileData } from "./parseFileData";
import { downloadTemplate } from "./downloadTemplate";

export const useImportQuestions = (subjects: Subject[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [parsedQuestions, setParsedQuestions] = useState<QuestionFormData[]>([]);

  const resetState = () => {
    setError(null);
    setProgress(0);
    setParsedQuestions([]);
  };

  const findSubjectId = (subjectName: string): string | null => {
    const subject = subjects.find(s => 
      s.title.toLowerCase().trim() === subjectName.toLowerCase().trim()
    );
    return subject ? subject.id : null;
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    
    resetState();
    setIsLoading(true);
    
    try {
      const questions = await parseFileData(file, findSubjectId, subjects);
      
      if (questions.length === 0) {
        toast.error("No valid questions found in the file");
        setIsLoading(false);
        return;
      }
      
      setParsedQuestions(questions);
      toast.success(`Successfully parsed ${questions.length} questions`);
      
    } catch (err) {
      console.error("Error parsing file:", err);
      setError(String(err));
      toast.error(`Error parsing file: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    progress,
    parsedQuestions,
    handleFileUpload,
    resetState,
    downloadTemplate
  };
};
