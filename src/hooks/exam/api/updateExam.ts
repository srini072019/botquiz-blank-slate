
import { supabase } from "@/integrations/supabase/client";
import { ExamFormData, ExamStatus } from "@/types/exam.types";
import { toast } from "sonner";
import { assignExamToCandidates } from './assignCandidates';

export const updateExamInApi = async (id: string, data: ExamFormData): Promise<boolean> => {
  try {
    console.log("Updating exam with ID:", id, "and data:", data);
    
    // Update exam record
    const { error: examError } = await supabase
      .from('exams')
      .update({
        title: data.title,
        description: data.description,
        course_id: data.courseId,
        time_limit: data.timeLimit,
        passing_score: data.passingScore,
        shuffle_questions: data.shuffleQuestions,
        status: data.status,
        start_date: data.startDate ? data.startDate.toISOString() : null,
        end_date: data.endDate ? data.endDate.toISOString() : null,
        updated_at: new Date().toISOString(),
        use_question_pool: data.useQuestionPool,
        question_pool: data.questionPool ? JSON.stringify(data.questionPool) : null,
      })
      .eq('id', id);

    if (examError) {
      console.error("Error updating exam:", examError);
      throw examError;
    }
    
    // Delete all existing question associations
    const { error: deleteError } = await supabase
      .from('exam_questions')
      .delete()
      .eq('exam_id', id);
      
    if (deleteError) {
      console.error("Error deleting existing exam questions:", deleteError);
      throw deleteError;
    }
    
    // Insert new question associations if not using question pool
    if (!data.useQuestionPool && data.questions && data.questions.length > 0) {
      console.log("Updating exam questions for exam:", id, "with questions:", data.questions);
      
      const examQuestions = data.questions.map((questionId, index) => ({
        exam_id: id,
        question_id: questionId,
        order_number: index + 1 // Maintain question order
      }));
      
      console.log("Inserting exam questions:", examQuestions);
      
      const { error: questionsError } = await supabase
        .from('exam_questions')
        .insert(examQuestions);
        
      if (questionsError) {
        console.error("Error updating exam questions:", questionsError);
        toast.warning("Exam updated but there was an issue updating questions");
      } else {
        console.log(`Successfully updated ${examQuestions.length} exam questions.`);
      }
    }

    // Update assignment statuses based on exam status
    await assignExamToCandidates(id, data.courseId, data.status === ExamStatus.PUBLISHED);
    
    toast.success("Exam updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating exam:", error);
    toast.error("Failed to update exam");
    return false;
  }
};
