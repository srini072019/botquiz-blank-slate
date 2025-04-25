
import { supabase } from "@/integrations/supabase/client";
import { ExamFormData, ExamStatus } from "@/types/exam.types";
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
    if (!data.useQuestionPool && data.questions && data.questions.length > 0) {
      console.log("Adding questions to exam:", data.questions);
      
      // Prepare the questions data with order numbers
      const examQuestions = data.questions.map((questionId, index) => ({
        exam_id: examData.id,
        question_id: questionId,
        order_number: index + 1 // Assign order based on array index
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
    } else if (data.useQuestionPool && data.questionPool) {
      console.log("Using question pool. Pool configuration:", data.questionPool);
      
      if (data.questionPool.subjects && data.questionPool.subjects.length > 0) {
        // For preview purposes, let's fetch some sample questions from the pool subjects
        // to populate the exam_questions table for preview functionality
        const subjectIds = data.questionPool.subjects.map(subject => subject.subjectId);
        
        if (subjectIds.length > 0) {
          console.log("Fetching sample questions from subject pool:", subjectIds);
          
          // Get questions from these subjects
          const { data: poolQuestions, error: poolQuestionsError } = await supabase
            .from('questions')
            .select('id')
            .in('subject_id', subjectIds)
            .limit(data.questionPool.totalQuestions || 10);
            
          if (!poolQuestionsError && poolQuestions && poolQuestions.length > 0) {
            console.log(`Found ${poolQuestions.length} questions for preview from pool subjects`);
            
            // Create exam questions entries for preview purposes
            const examQuestions = poolQuestions.map((question, index) => ({
              exam_id: examData.id,
              question_id: question.id,
              order_number: index + 1
            }));
            
            const { error: questionsError } = await supabase
              .from('exam_questions')
              .insert(examQuestions);
              
            if (questionsError) {
              console.error("Error adding pool preview questions:", questionsError);
            } else {
              console.log(`Added ${examQuestions.length} preview questions from pool`);
            }
          } else if (poolQuestionsError) {
            console.error("Error fetching pool questions:", poolQuestionsError);
          } else {
            console.log("No questions found in the selected subject pool");
          }
        }
      }
    }
    
    try {
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
