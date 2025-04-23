
import { supabase } from "@/integrations/supabase/client";

interface AssignmentResult {
  success: boolean;
  message?: string;
}

export const assignExamToCandidates = async (
  examId: string, 
  courseId: string, 
  published: boolean = false
): Promise<AssignmentResult> => {
  try {
    console.log(`Assigning exam ${examId} to candidates for course ${courseId}, published: ${published}`);
    
    // Skip assignment if the exam is not published
    if (!published) {
      console.log("Exam is not published, skipping candidate assignment");
      return { 
        success: true,
        message: "Exam is not published, no candidates were assigned" 
      };
    }

    // Get candidates enrolled in this course
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select('user_id')
      .eq('course_id', courseId);
      
    if (enrollmentError) {
      console.error("Error fetching course enrollments:", enrollmentError);
      return { 
        success: false, 
        message: "Failed to fetch course enrollments" 
      };
    }
    
    console.log(`Found ${enrollments?.length || 0} enrolled candidates`);
    
    if (!enrollments || enrollments.length === 0) {
      return { 
        success: true, 
        message: "No candidates are enrolled in this course" 
      };
    }
    
    // Create assignments for each enrolled user
    const assignments = enrollments.map(enrollment => ({
      exam_id: examId,
      candidate_id: enrollment.user_id,
      status: 'scheduled', // Initialize as scheduled
      assigned_at: new Date().toISOString(),
    }));
    
    console.log(`Creating ${assignments.length} exam assignments`);
    
    // Insert assignments
    const { error: assignmentError } = await supabase
      .from('exam_candidate_assignments')
      .insert(assignments);
      
    if (assignmentError) {
      console.error("Error creating exam assignments:", assignmentError);
      return { 
        success: false, 
        message: `Failed to assign exam to candidates: ${assignmentError.message}` 
      };
    }
    
    console.log(`Successfully assigned exam to ${assignments.length} candidates`);
    return { 
      success: true,
      message: `Assigned exam to ${assignments.length} candidates` 
    };
  } catch (error) {
    console.error("Error in assignExamToCandidates:", error);
    return { 
      success: false, 
      message: `Unexpected error during exam assignment: ${(error as Error).message}` 
    };
  }
};
