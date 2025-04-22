import { supabase } from "@/integrations/supabase/client";
import { Exam, ExamFormData, ExamStatus } from "@/types/exam.types";
import { toast } from "sonner";

export const fetchExamsFromApi = async (courseId?: string, instructorId?: string): Promise<Exam[]> => {
  try {
    let query = supabase
      .from('exams')
      .select('*, exam_questions(question_id, order_number)');
    
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    if (instructorId) {
      query = query.eq('instructor_id', instructorId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
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

export const createExamInApi = async (data: ExamFormData): Promise<string | null> => {
  try {
    console.log("Creating exam with data:", data);
    
    // Insert exam record
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert({
        title: data.title,
        description: data.description,
        course_id: data.courseId,
        instructor_id: await supabase.auth.getUser().then(res => res.data.user?.id),
        time_limit: data.timeLimit,
        passing_score: data.passingScore,
        shuffle_questions: data.shuffleQuestions,
        status: data.status,
        start_date: data.startDate ? data.startDate.toISOString() : null,
        end_date: data.endDate ? data.endDate.toISOString() : null,
        use_question_pool: data.useQuestionPool,
        question_pool: data.questionPool ? JSON.stringify(data.questionPool) : null,
      })
      .select()
      .single();

    if (examError) {
      console.error("Error creating exam:", examError);
      throw examError;
    }
    
    console.log("Exam created:", examData);
    
    // Insert question associations if not using question pool
    if (!data.useQuestionPool && data.questions.length > 0) {
      console.log("Adding questions to exam:", data.questions);
      const examQuestions = data.questions.map((questionId, index) => ({
        exam_id: examData.id,
        question_id: questionId,
        order_number: index + 1,
      }));
      
      const { error: questionsError } = await supabase
        .from('exam_questions')
        .insert(examQuestions);
        
      if (questionsError) {
        console.error("Error adding questions to exam:", questionsError);
        throw questionsError;
      } else {
        console.log(`Successfully added ${examQuestions.length} questions to exam`);
      }
    }
    
    // Always assign exam to candidates for the course, regardless of status
    // We will set different assignment status based on whether it's published or not
    await assignExamToCandidates(examData.id, data.courseId, data.status === 'published');
    
    toast.success("Exam created successfully");
    return examData.id;
  } catch (error) {
    console.error("Error creating exam:", error);
    toast.error("Failed to create exam");
    return null;
  }
};

// Helper function to assign exam to all candidates enrolled in the course
const assignExamToCandidates = async (examId: string, courseId: string, isPublished: boolean = false) => {
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
    let initialStatus = 'pending';
    
    // If published, set to 'available' or 'scheduled' based on start date
    if (isPublished) {
      initialStatus = startDate && startDate > now ? 'scheduled' : 'available';
    }
    
    // First check if assignments already exist to avoid duplicates
    const { data: existingAssignments, error: checkError } = await supabase
      .from('exam_candidate_assignments')
      .select('candidate_id')
      .eq('exam_id', examId)
      .in('candidate_id', enrollments.map(e => e.user_id));
      
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
    
    console.log(`Creating ${newAssignments.length} new assignments with status: ${initialStatus}`, newAssignments);
    
    // Try batch insert first
    try {
      const { error: assignmentError } = await supabase
        .from('exam_candidate_assignments')
        .insert(newAssignments);
      
      if (assignmentError) {
        console.error("Error assigning exam to candidates in batch:", assignmentError);
        console.log("Error details:", JSON.stringify(assignmentError));
        // Fall back to individual inserts
        throw assignmentError;
      } else {
        console.log(`Exam successfully assigned to ${newAssignments.length} new candidates in batch`);
      }
    } catch (batchError) {
      console.log("Falling back to individual assignment inserts");
      console.log("Batch error details:", batchError);
      
      // Try individual inserts
      let successCount = 0;
      for (const assignment of newAssignments) {
        try {
          console.log("Attempting to insert assignment:", assignment);
          const { data, error } = await supabase
            .from('exam_candidate_assignments')
            .insert(assignment)
            .select();
            
          if (error) {
            console.error(`Error assigning exam to candidate ${assignment.candidate_id}:`, error);
            console.log("Error details:", JSON.stringify(error));
          } else {
            console.log("Successfully inserted assignment:", data);
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
    
    // If exam is not published but has existing assignments, we need to update those to pending
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
  } catch (error) {
    console.error("Error in assignExamToCandidates:", error);
    
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Check if the status constraint might be the issue
    console.log("This might be due to an invalid status value. Check that the status values match the allowed values in the database constraint.");
    
    // Check if user_id foreign key constraint might be the issue
    console.log("This might also be due to a foreign key constraint. Check that candidate_id values exist in the referenced table.");
    
    toast.error("Failed to assign exam to candidates. Check console for details.");
  }
};

export const updateExamInApi = async (id: string, data: ExamFormData): Promise<boolean> => {
  try {
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

    if (examError) throw examError;
    
    // Delete all existing question associations
    const { error: deleteError } = await supabase
      .from('exam_questions')
      .delete()
      .eq('exam_id', id);
      
    if (deleteError) throw deleteError;
    
    // Insert new question associations if not using question pool
    if (!data.useQuestionPool && data.questions.length > 0) {
      const examQuestions = data.questions.map((questionId, index) => ({
        exam_id: id,
        question_id: questionId,
        order_number: index + 1,
      }));
      
      const { error: questionsError } = await supabase
        .from('exam_questions')
        .insert(examQuestions);
        
      if (questionsError) throw questionsError;
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
