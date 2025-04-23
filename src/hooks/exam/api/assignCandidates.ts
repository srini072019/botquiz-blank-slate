
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper function to assign exam to all candidates enrolled in the course
export const assignExamToCandidates = async (examId: string, courseId: string, isPublished: boolean = false) => {
  try {
    console.log(`Assigning exam to candidates. Exam ID: ${examId}, Course ID: ${courseId}, Published: ${isPublished}`);
    
    // Get all candidates enrolled in the course
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select('user_id')
      .eq('course_id', courseId);
    
    if (enrollmentsError) {
      console.error("Error fetching course enrollments:", enrollmentsError);
      throw enrollmentsError;
    }
    
    console.log(`Found ${enrollments?.length || 0} enrollments for course:`, courseId);
    
    if (!enrollments || enrollments.length === 0) {
      console.log("No candidates enrolled in this course");
      return;
    }
    
    // Get exam details to determine initial status
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('start_date, end_date')
      .eq('id', examId)
      .single();
      
    if (examError) {
      console.error("Error fetching exam details:", examError);
      throw examError;
    }
    
    // Determine exam status based on dates and whether it's published
    const now = new Date();
    const startDate = examData.start_date ? new Date(examData.start_date) : null;
    
    // Default to 'pending' if not published
    let initialStatus: 'pending' | 'scheduled' | 'available' | 'completed' = 'pending';
    
    // If published, set to 'available' or 'scheduled' based on start date
    if (isPublished) {
      initialStatus = startDate && startDate > now ? 'scheduled' : 'available';
    }
    
    console.log(`Using initial assignment status: ${initialStatus}`);
    
    // First check if assignments already exist to avoid duplicates
    const { data: existingAssignments, error: checkError } = await supabase
      .from('exam_candidate_assignments')
      .select('candidate_id')
      .eq('exam_id', examId);
      
    if (checkError) {
      console.error("Error checking existing assignments:", checkError);
      throw checkError;
    }
    
    // Filter out candidates that already have assignments
    const existingCandidateIds = existingAssignments?.map(a => a.candidate_id) || [];
    console.log("Existing assignment candidate IDs:", existingCandidateIds);
    
    const newAssignments = enrollments
      .filter(e => !existingCandidateIds.includes(e.user_id))
      .map(enrollment => ({
        exam_id: examId,
        candidate_id: enrollment.user_id,
        status: initialStatus,
      }));
    
    if (newAssignments.length === 0) {
      console.log("All candidates already have assignments for this exam");
      return;
    }
    
    console.log(`Creating ${newAssignments.length} new assignments with status: ${initialStatus}`);
    
    try {
      // Try batch insert first
      const { data, error: assignmentError } = await supabase
        .from('exam_candidate_assignments')
        .insert(newAssignments)
        .select();
      
      if (assignmentError) {
        throw assignmentError;
      }
      
      console.log(`Exam successfully assigned to ${newAssignments.length} new candidates in batch`);
      
    } catch (batchError) {
      console.error("Error in batch assignment:", batchError);
      
      // Fall back to individual inserts
      let successCount = 0;
      
      for (const assignment of newAssignments) {
        try {
          const { error } = await supabase
            .from('exam_candidate_assignments')
            .insert(assignment);
            
          if (error) {
            console.error(`Error assigning exam to candidate ${assignment.candidate_id}:`, error);
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Exception assigning exam to candidate ${assignment.candidate_id}:`, err);
        }
      }
      
      console.log(`Individually assigned exam to ${successCount} out of ${newAssignments.length} candidates`);
      
      if (successCount === 0) {
        throw new Error("Failed to assign exam to any candidates");
      }
    }
    
    // If exam is not published but has existing assignments, update those to pending
    if (!isPublished && existingCandidateIds.length > 0) {
      console.log(`Updating ${existingCandidateIds.length} existing assignments to 'pending' status`);
      
      const { error: updateError } = await supabase
        .from('exam_candidate_assignments')
        .update({ status: 'pending' })
        .eq('exam_id', examId)
        .in('candidate_id', existingCandidateIds);
        
      if (updateError) {
        console.error("Error updating existing assignments:", updateError);
        throw updateError;
      }
      
      console.log("Existing assignments updated to 'pending'");
    }
    
    return true;
  } catch (error) {
    console.error("Error in assignExamToCandidates:", error);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    
    console.log("This might be due to an invalid status value. Ensure status is one of: 'pending', 'scheduled', 'available', 'completed'");
    console.log("This might also be due to a foreign key constraint. Check that candidate_id values exist in the referenced table");
    
    toast.error("Failed to assign exam to candidates. Check console for details.");
    throw error;
  }
};
