
import { useState, useEffect } from "react";
import { Exam, ExamStatus, ExamFormData } from "@/types/exam.types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/question.types";
import { 
  fetchExamsFromApi, 
  createExamInApi, 
  updateExamInApi, 
  deleteExamInApi, 
  updateExamStatusInApi 
} from "./api";

interface UseExamsResult {
  exams: Exam[];
  isLoading: boolean;
  error: string | null;
  fetchExams: (courseId?: string) => Promise<void>;
  createExam: (data: ExamFormData) => Promise<boolean>;
  updateExam: (id: string, data: ExamFormData) => Promise<boolean>;
  deleteExam: (id: string) => Promise<boolean>;
  publishExam: (id: string) => Promise<boolean>;
  archiveExam: (id: string) => Promise<boolean>;
  getExam: (id: string) => Exam | undefined;
  getExamsByCourse: (courseId: string) => Exam[];
  getExamWithQuestions: (id: string, questions: Question[]) => { exam: Exam | null; examQuestions: Question[] };
}

export const useExams = (courseId?: string): UseExamsResult => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch exams from the API
  const fetchExams = async (courseIdParam?: string) => {
    const effectiveCourseId = courseIdParam || courseId;
    
    setIsLoading(true);
    setError(null);

    try {
      const userId = await supabase.auth.getUser().then(res => res.data.user?.id);
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      const fetchedExams = await fetchExamsFromApi(effectiveCourseId, userId);
      setExams(fetchedExams);
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError("Failed to fetch exams");
      toast.error("Failed to fetch exams");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new exam
  const createExam = async (data: ExamFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const examId = await createExamInApi(data);
      if (examId) {
        await fetchExams();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Failed to create exam");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing exam
  const updateExam = async (id: string, data: ExamFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await updateExamInApi(id, data);
      if (success) {
        await fetchExams();
      }
      return success;
    } catch (error) {
      console.error("Error updating exam:", error);
      toast.error("Failed to update exam");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an exam
  const deleteExam = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await deleteExamInApi(id);
      if (success) {
        setExams(exams.filter(exam => exam.id !== id));
      }
      return success;
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Publish an exam (change status to PUBLISHED)
  const publishExam = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await updateExamStatusInApi(id, ExamStatus.PUBLISHED);
      if (success) {
        setExams(exams.map(exam => 
          exam.id === id ? { ...exam, status: ExamStatus.PUBLISHED } : exam
        ));
      }
      return success;
    } catch (error) {
      console.error("Error publishing exam:", error);
      toast.error("Failed to publish exam");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Archive an exam (change status to ARCHIVED)
  const archiveExam = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await updateExamStatusInApi(id, ExamStatus.ARCHIVED);
      if (success) {
        setExams(exams.map(exam => 
          exam.id === id ? { ...exam, status: ExamStatus.ARCHIVED } : exam
        ));
      }
      return success;
    } catch (error) {
      console.error("Error archiving exam:", error);
      toast.error("Failed to archive exam");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get exam by ID
  const getExam = (id: string): Exam | undefined => {
    return exams.find(exam => exam.id === id);
  };

  // Get exams by course ID
  const getExamsByCourse = (courseId: string): Exam[] => {
    return exams.filter(exam => exam.courseId === courseId);
  };

  // Get exam with associated questions
  const getExamWithQuestions = (id: string, questionsList: Question[]): { exam: Exam | null; examQuestions: Question[] } => {
    const exam = exams.find(e => e.id === id) || null;
    
    if (!exam) {
      return { exam: null, examQuestions: [] };
    }
    
    // Filter questions that are associated with this exam
    let examQuestions: Question[] = [];
    
    if (exam.questions && exam.questions.length > 0) {
      // Use existing question IDs from the exam object
      examQuestions = questionsList.filter(q => exam.questions.includes(q.id));
    } else {
      // If no questions on the exam object, try to fetch them from the database
      console.log("No questions found on exam object, will fetch from database in useExam hook");
    }
    
    return { exam, examQuestions };
  };

  useEffect(() => {
    fetchExams();
  }, [courseId]);

  return { 
    exams, 
    isLoading, 
    error, 
    fetchExams, 
    createExam, 
    updateExam, 
    deleteExam, 
    publishExam, 
    archiveExam,
    getExam,
    getExamsByCourse,
    getExamWithQuestions
  };
};
