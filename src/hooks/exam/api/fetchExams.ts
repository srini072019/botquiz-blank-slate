
import { supabase } from "@/integrations/supabase/client";
import { Exam, ExamStatus } from "@/types/exam.types";
import { toast } from "sonner";

export const fetchExamsFromApi = async (courseId?: string, instructorId?: string): Promise<Exam[]> => {
  try {
    console.log("Fetching exams with courseId:", courseId, "instructorId:", instructorId);
    
    // First, construct the base query
    let query = supabase
      .from('exams')
      .select(`
        *,
        exam_questions(question_id, order_number)
      `);
    
    // Add filters if provided
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    if (instructorId) {
      query = query.eq('instructor_id', instructorId);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching exams:", error);
      throw error;
    }
    
    console.log("Raw exams data:", data);
    
    return data.map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description || "",
      courseId: exam.course_id,
      instructorId: exam.instructor_id,
      timeLimit: exam.time_limit,
      passingScore: exam.passing_score,
      shuffleQuestions: exam.shuffle_questions,
      status: exam.status as ExamStatus,
      questions: exam.exam_questions?.map(eq => eq.question_id) || [],
      createdAt: new Date(exam.created_at),
      updatedAt: new Date(exam.updated_at),
      startDate: exam.start_date ? new Date(exam.start_date) : undefined,
      endDate: exam.end_date ? new Date(exam.end_date) : undefined,
      useQuestionPool: Boolean(exam.use_question_pool ?? false),
      questionPool: exam.question_pool ? JSON.parse(String(exam.question_pool)) : undefined,
    }));
  } catch (error) {
    console.error("Error fetching exams:", error);
    toast.error("Failed to load exams");
    return [];
  }
};
