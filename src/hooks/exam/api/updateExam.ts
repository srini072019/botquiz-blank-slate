
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
    } else if (data.useQuestionPool && data.questionPool) {
      console.log("Using question pool. Pool configuration:", data.questionPool);
      
      // For actual exam questions with question pool, fetch and insert questions
      if (data.questionPool.subjects && data.questionPool.subjects.length > 0) {
        const subjectIds = data.questionPool.subjects.map(subject => subject.subjectId);
        
        if (subjectIds.length > 0) {
          console.log("Fetching questions from subject pool:", subjectIds);
          
          // Calculate total questions needed
          const totalNeeded = data.questionPool.totalQuestions || 
                             data.questionPool.subjects.reduce((sum, s) => sum + s.count, 0);
          
          // Get questions from these subjects
          const { data: poolQuestions, error: poolQuestionsError } = await supabase
            .from('questions')
            .select('id')
            .in('subject_id', subjectIds)
            .limit(totalNeeded);
            
          if (!poolQuestionsError && poolQuestions && poolQuestions.length > 0) {
            console.log(`Found ${poolQuestions.length} questions for exam from pool subjects`);
            
            // Create exam questions entries
            const examQuestions = poolQuestions.map((question, index) => ({
              exam_id: id,
              question_id: question.id,
              order_number: index + 1
            }));
            
            const { error: questionsError } = await supabase
              .from('exam_questions')
              .insert(examQuestions);
              
            if (questionsError) {
              console.error("Error adding pool questions:", questionsError);
              toast.warning("Exam updated but there was an issue adding questions from pool");
            } else {
              console.log(`Added ${examQuestions.length} questions from pool to exam`);
            }
          } else if (poolQuestionsError) {
            console.error("Error fetching pool questions:", poolQuestionsError);
            toast.warning("Exam updated but couldn't fetch questions from the pool");
          } else {
            console.log("No questions found in the selected subject pool");
            toast.warning("No questions found in the selected subject pool");
          }
        }
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
