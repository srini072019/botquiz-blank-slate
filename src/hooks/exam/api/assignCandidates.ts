
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssignmentResult {
  success: boolean;
  message?: string;
}

interface Assignment {
  exam_id: string;
  candidate_id: string;
  status: 'pending' | 'scheduled' | 'available' | 'completed';
  assigned_at: string;
}

/**
 * Assigns an exam to all candidates enrolled in the specified course.
 * If the exam is published, sets the status to 'available' or 'scheduled' based on start date.
 * Otherwise, sets the status to 'pending'.
 */
export const assignExamToCandidates = async (
  examId: string, 
  courseId: string, 
  published: boolean = false
): Promise<AssignmentResult> => {
  try {
    console.log(`Assigning exam ${examId} to candidates for course ${courseId}, published: ${published}`);
    
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
      return {
        success: true,
        message: "No candidates are enrolled in this course"
      };
    }
    
    // Determine exam status based on dates and whether it's published
    const now = new Date();
    const startDate = examData.start_date ? new Date(examData.start_date) : null;
    
    // Default to 'pending' if not published
    let initialStatus: 'pending' | 'scheduled' | 'available' | 'completed' = 'pending';
    
    // If published, set to 'available' or 'scheduled' based on start date
    if (published) {
      initialStatus = startDate && startDate > now ? 'scheduled' : 'available';
    }
    
    console.log(`Using initial assignment status: ${initialStatus}`);
    
    // Check if assignments already exist to avoid duplicates
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
    
    const newAssignments: Assignment[] = enrollments
      .filter(e => !existingCandidateIds.includes(e.user_id))
      .map(enrollment => ({
        exam_id: examId,
        candidate_id: enrollment.user_id,
        status: initialStatus,
        assigned_at: new Date().toISOString()
      }));
    
    if (newAssignments.length === 0) {
      console.log("All candidates already have assignments for this exam");
      
      // Update existing assignments based on publish status
      if (published) {
        const { error: updateError } = await supabase
          .from('exam_candidate_assignments')
          .update({ status: initialStatus })
          .eq('exam_id', examId);
          
        if (updateError) {
          console.error("Error updating existing assignments:", updateError);
          return { 
            success: false, 
            message: "Failed to update existing assignments" 
          };
        }
        
        console.log(`Updated ${existingCandidateIds.length} assignments to status: ${initialStatus}`);
      }
      
      return { 
        success: true,
        message: "Existing assignments were updated" 
      };
    }
    
    console.log(`Creating ${newAssignments.length} new assignments with status: ${initialStatus}`);
    
    // Insert new assignments
    const { error: assignmentError } = await supabase
      .from('exam_candidate_assignments')
      .insert(newAssignments);
    
    if (assignmentError) {
      console.error("Error assigning exam to candidates:", assignmentError);
      throw assignmentError;
    }
    
    console.log(`Successfully assigned exam to ${newAssignments.length} new candidates`);
    
    // If we're publishing, also update any existing assignments
    if (published && existingCandidateIds.length > 0) {
      const { error: updateError } = await supabase
        .from('exam_candidate_assignments')
        .update({ status: initialStatus })
        .eq('exam_id', examId)
        .in('candidate_id', existingCandidateIds);
        
      if (updateError) {
        console.error("Error updating existing assignments:", updateError);
        return { 
          success: true, 
          message: `Assigned to ${newAssignments.length} new candidates but failed to update existing ones` 
        };
      }
      
      console.log(`Updated ${existingCandidateIds.length} existing assignments to status: ${initialStatus}`);
    }
    
    return { 
      success: true,
      message: `Exam assigned to ${newAssignments.length} candidates` 
    };
  } catch (error) {
    console.error("Error in assignExamToCandidates:", error);
    return { 
      success: false, 
      message: `Unexpected error during exam assignment: ${(error as Error).message}` 
    };
  }
};
