
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const deleteExamInApi = async (id: string): Promise<boolean> => {
  try {
    // Note: exam_questions will be automatically deleted due to CASCADE
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    toast.success("Exam deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting exam:", error);
    toast.error("Failed to delete exam");
    return false;
  }
};
