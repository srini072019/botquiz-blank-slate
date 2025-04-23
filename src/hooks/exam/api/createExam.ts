
import { supabase } from "@/integrations/supabase/client";
import { ExamFormData } from "@/types/exam.types";
import { toast } from "sonner";
import { assignExamToCandidates } from './assignCandidates';

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
      
      try {
        // Prepare the questions data
        const examQuestions = data.questions.map((questionId, index) => ({
          exam_id: examData.id,
          question_id: questionId,
          order_number: index + 1,
        }));
        
        console.log("Inserting exam questions:", examQuestions);
        
        // Insert all exam questions
        const { error: questionsError } = await supabase
          .from('exam_questions')
          .insert(examQuestions);
          
        if (questionsError) {
          console.error("Error adding questions to exam:", questionsError);
          toast.warning("Exam created but there was an issue adding questions");
        } else {
          console.log(`Successfully added ${examQuestions.length} questions to exam.`);
        }
      } catch (questionInsertError) {
        console.error("Error during question insertion:", questionInsertError);
        // Continue despite error to at least create the exam
        toast.warning("Exam created but there was an issue adding questions");
      }
    }
    
    try {
      // Assign exam to candidates for the course
      await assignExamToCandidates(examData.id, data.courseId, data.status === 'published');
      toast.success("Exam created successfully");
      return examData.id;
    } catch (assignmentError) {
      console.error("Error assigning exams:", assignmentError);
      toast.warning("Exam created but there was an issue assigning it to candidates");
      return examData.id;
    }
  } catch (error) {
    console.error("Error creating exam:", error);
    toast.error("Failed to create exam");
    return null;
  }
};
