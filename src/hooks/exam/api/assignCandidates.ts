
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { examCandidateAssignmentColumns } from "@/types/exam-candidate.types";

export const assignExamToCandidates = async (
  examId: string,
  courseId: string,
  isPublished: boolean = false
): Promise<boolean> => {
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
      return true; // Not an error, just no candidates to assign
    }
    
    // Get exam details to determine initial status
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('start_date, end_date, status')
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
    let initialStatus = 'pending';
    
    // If published, set to 'available' or 'scheduled' based on start date
    if (isPublished || examData.status === 'published') {
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
        assigned_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }));
    
    if (newAssignments.length === 0) {
      console.log("All candidates already have assignments for this exam");
      
      // If exam is published, update existing assignments to the appropriate status
      if (isPublished || examData.status === 'published') {
        const { error: updateError } = await supabase
          .from('exam_candidate_assignments')
          .update({ status: initialStatus })
          .eq('exam_id', examId);
          
        if (updateError) {
          console.error("Error updating existing assignments:", updateError);
          return false;
        }
        
        console.log(`Successfully updated assignment status to ${initialStatus} for existing assignments`);
      }
      
      return true;
    }
    
    // Create new assignments
    console.log(`Creating ${newAssignments.length} new assignments with status: ${initialStatus}`);
    console.log("Assignment data sample:", newAssignments[0]);
    
    const { error: insertError } = await supabase
      .from('exam_candidate_assignments')
      .insert(newAssignments);
      
    if (insertError) {
      console.error("Error creating assignments:", insertError);
      throw insertError;
    }
    
    console.log(`Successfully assigned exam to ${newAssignments.length} new candidates`);
    
    // If exam is published, ensure all existing assignments have the correct status
    if ((isPublished || examData.status === 'published') && existingCandidateIds.length > 0) {
      const { error: updateError } = await supabase
        .from('exam_candidate_assignments')
        .update({ status: initialStatus })
        .eq('exam_id', examId)
        .in('candidate_id', existingCandidateIds);
        
      if (updateError) {
        console.error("Error updating existing assignments:", updateError);
        return false;
      }
      
      console.log(`Successfully updated status to ${initialStatus} for ${existingCandidateIds.length} existing assignments`);
    }
    
    return true;
  } catch (error) {
    console.error("Error in assignExamToCandidates:", error);
    return false;
  }
};
