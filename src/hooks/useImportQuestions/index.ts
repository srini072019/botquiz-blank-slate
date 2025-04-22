
import { toast } from "sonner";
import { Subject } from "@/types/subject.types";
import { useImportState } from "./useImportState";
import { parseFileData } from "./parseFileData";
import { downloadTemplate } from "./downloadTemplate";
import { findSubjectId } from "./subjectMatcher";

export const useImportQuestions = (subjects: Subject[]) => {
  const {
    isLoading,
    error,
    progress,
    parsedQuestions,
    resetState,
    setLoading,
    setError,
    setParsedQuestions
  } = useImportState();

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    
    resetState();
    setLoading(true);
    
    try {
      console.log("Available subjects for matching:", subjects.map(s => s.title));
      const questions = await parseFileData(file, (name) => findSubjectId(name, subjects), subjects);
      
      if (questions.length === 0) {
        toast.error("No valid questions found in the file");
        setLoading(false);
        return;
      }
      
      setParsedQuestions(questions);
      toast.success(`Successfully parsed ${questions.length} questions`);
      
    } catch (err) {
      console.error("Error parsing file:", err);
      setError(String(err));
      toast.error(`Error parsing file: ${err}`);
    } finally {
      setLoading(false);
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
