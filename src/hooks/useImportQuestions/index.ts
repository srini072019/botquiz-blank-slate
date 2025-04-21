
import { useState } from "react";
import { toast } from "sonner";
import { QuestionFormData } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
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
    // Improved subject matching logic - more lenient matching
    // Convert subject names to lowercase and trim whitespace for comparison
    const normalizedSubjectName = subjectName.toLowerCase().trim();
    
    // First try exact match
    const exactMatch = subjects.find(s => 
      s.title.toLowerCase().trim() === normalizedSubjectName
    );
    
    if (exactMatch) return exactMatch.id;
    
    // If no exact match, try case-insensitive contains match
    const partialMatch = subjects.find(s => 
      s.title.toLowerCase().includes(normalizedSubjectName) || 
      normalizedSubjectName.includes(s.title.toLowerCase())
    );
    
    return partialMatch ? partialMatch.id : null;
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    
    resetState();
    setIsLoading(true);
    
    try {
      console.log("Available subjects for matching:", subjects.map(s => s.title));
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
