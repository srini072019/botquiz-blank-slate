
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/question.types";
import { mapToDifficultyLevel, mapToQuestionType } from "@/utils/questionUtils";
import { ExamData } from "../types/exam.types";

export const fetchExamData = async (examId: string): Promise<{ examData: ExamData | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (error) throw error;
    return { examData: data, error: null };
  } catch (error) {
    console.error("Error fetching exam:", error);
    return { examData: null, error: error as Error };
  }
};

export const fetchExamQuestions = async (examId: string): Promise<{ 
  questionLinks: { question_id: string; order_number: number }[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('question_id, order_number')
      .eq('exam_id', examId)
      .order('order_number');

    if (error) throw error;
    return { questionLinks: data, error: null };
  } catch (error) {
    console.error("Error fetching exam questions:", error);
    return { questionLinks: null, error: error as Error };
  }
};

export const fetchQuestionsByIds = async (questionIds: string[]): Promise<{
  questions: Question[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id, 
        text, 
        type, 
        difficulty_level,
        explanation,
        created_at,
        updated_at,
        question_options (id, text, is_correct)
      `)
      .in('id', questionIds);

    if (error) throw error;

    const questions = data.map(q => ({
      id: q.id,
      text: q.text,
      type: mapToQuestionType(q.type),
      difficultyLevel: mapToDifficultyLevel(q.difficulty_level),
      explanation: q.explanation || undefined,
      options: q.question_options.map(o => ({
        id: o.id,
        text: o.text,
        isCorrect: o.is_correct
      })),
      subjectId: '', // We don't need this for preview
      createdAt: new Date(q.created_at),
      updatedAt: new Date(q.updated_at)
    }));

    return { questions, error: null };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return { questions: null, error: error as Error };
  }
};

export const fetchQuestionsBySubjects = async (subjectIds: string[]): Promise<{
  questions: Question[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id, 
        text, 
        type, 
        difficulty_level,
        explanation,
        subject_id,
        created_at,
        updated_at,
        question_options (id, text, is_correct)
      `)
      .in('subject_id', subjectIds);

    if (error) throw error;

    const questions = data.map(q => ({
      id: q.id,
      text: q.text,
      type: mapToQuestionType(q.type),
      difficultyLevel: mapToDifficultyLevel(q.difficulty_level),
      explanation: q.explanation || undefined,
      subjectId: q.subject_id,
      createdAt: new Date(q.created_at),
      updatedAt: new Date(q.updated_at),
      options: q.question_options.map(o => ({
        id: o.id,
        text: o.text,
        isCorrect: o.is_correct
      }))
    }));

    return { questions, error: null };
  } catch (error) {
    console.error("Error fetching pool questions:", error);
    return { questions: null, error: error as Error };
  }
};
