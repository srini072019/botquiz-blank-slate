
import { supabase } from "@/integrations/supabase/client";
import { ExamStatus } from "@/types/exam.types";
import { toast } from "sonner";
import { assignExamToCandidates } from './assignCandidates';

export const updateExamStatusInApi = async (id: string, status: ExamStatus): Promise<boolean> => {
  try {
    const { data: exam, error: fetchError } = await supabase
      .from('exams')
      .select('course_id')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching exam details:", fetchError);
      throw fetchError;
    }
    
    const { error } = await supabase
      .from('exams')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    
    // Update exam candidate assignments based on new status
    if (exam) {
      await assignExamToCandidates(id, exam.course_id, status === ExamStatus.PUBLISHED);
    }
    
    toast.success(`Exam ${status.toLowerCase()} successfully`);
    return true;
  } catch (error) {
    console.error(`Error updating exam status to ${status}:`, error);
    toast.error(`Failed to ${status.toLowerCase()} exam`);
    return false;
  }
};
