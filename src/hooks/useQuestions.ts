
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Question, QuestionFormData, QuestionType, DifficultyLevel } from "@/types/question.types";
import { supabase } from "@/integrations/supabase/client";
import { mapToQuestionType, mapToDifficultyLevel } from "@/utils/questionUtils";

export const useQuestions = (subjectId?: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('questions')
        .select(`
          *,
          question_options (*)
        `);
      
      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const transformedQuestions: Question[] = data.map(question => ({
        id: question.id,
        text: question.text,
        type: mapToQuestionType(question.type),
        options: question.question_options.map((option: any) => ({
          id: option.id,
          text: option.text,
          isCorrect: option.is_correct
        })),
        subjectId: question.subject_id,
        difficultyLevel: mapToDifficultyLevel(question.difficulty_level),
        explanation: question.explanation || "",
        createdAt: new Date(question.created_at),
        updatedAt: new Date(question.updated_at),
      }));
      
      setQuestions(transformedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const createQuestion = async (data: QuestionFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // First insert the question
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert({
          text: data.text,
          type: data.type,
          subject_id: data.subjectId,
          difficulty_level: data.difficultyLevel,
          explanation: data.explanation,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Then insert all options
      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(
          data.options.map(option => ({
            question_id: questionData.id,
            text: option.text,
            is_correct: option.isCorrect
          }))
        );

      if (optionsError) throw optionsError;

      // Refresh questions list
      await fetchQuestions();
      toast.success("Question created successfully");
      return true;
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuestion = async (id: string, data: QuestionFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // First, delete existing options for the question
      const { error: deleteOptionsError } = await supabase
        .from('question_options')
        .delete()
        .eq('question_id', id);

      if (deleteOptionsError) throw deleteOptionsError;

      // Update the question
      const { error: questionError } = await supabase
        .from('questions')
        .update({
          text: data.text,
          type: data.type,
          subject_id: data.subjectId,
          difficulty_level: data.difficultyLevel,
          explanation: data.explanation,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (questionError) throw questionError;

      // Insert the updated options
      const { error: insertOptionsError } = await supabase
        .from('question_options')
        .insert(
          data.options.map(option => ({
            question_id: id,
            text: option.text,
            is_correct: option.isCorrect,
          }))
        );

      if (insertOptionsError) throw insertOptionsError;

      // Refresh questions list
      await fetchQuestions();
      toast.success("Question updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuestion = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Delete the question options first
      const { error: deleteOptionsError } = await supabase
        .from('question_options')
        .delete()
        .eq('question_id', id);

      if (deleteOptionsError) throw deleteOptionsError;

      // Then delete the question
      const { error: questionError } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (questionError) throw questionError;

      // Refresh questions list
      await fetchQuestions();
      toast.success("Question deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [subjectId]);

  return {
    questions,
    isLoading,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    fetchQuestions,
  };
};
