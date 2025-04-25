
import { useState, useEffect } from "react";
import { Exam, ExamStatus } from "@/types/exam.types";
import { Question } from "@/types/question.types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseExamResult {
  exam: Exam | null;
  examQuestions: Question[];
  isLoading: boolean;
  error: string | null;
}

interface ExamData {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  instructor_id: string;
  time_limit: number;
  passing_score: number;
  shuffle_questions: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  start_date: string | null;
  end_date: string | null;
  use_question_pool: boolean | null;
  question_pool: string | null;
}

// Transform database exam data to our application type
const transformExamData = (examData: ExamData): Exam => ({
  id: examData.id,
  title: examData.title,
  description: examData.description || "",
  courseId: examData.course_id,
  instructorId: examData.instructor_id,
  timeLimit: examData.time_limit,
  passingScore: examData.passing_score,
  shuffleQuestions: examData.shuffle_questions,
  status: examData.status as ExamStatus,
  questions: [],
  createdAt: new Date(examData.created_at),
  updatedAt: new Date(examData.updated_at),
  startDate: examData.start_date ? new Date(examData.start_date) : undefined,
  endDate: examData.end_date ? new Date(examData.end_date) : undefined,
  useQuestionPool: examData.use_question_pool ?? false,
  questionPool: examData.question_pool ? JSON.parse(String(examData.question_pool)) : undefined,
});

export const useExam = (
  examId: string | undefined,
  getExamWithQuestions: (id: string, questions: Question[]) => { exam: Exam | null; examQuestions: Question[] },
  questions: Question[]
): UseExamResult => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempted, setLoadAttempted] = useState(false);

  useEffect(() => {
    const loadExam = async () => {
      if (!examId) {
        setIsLoading(false);
        return;
      }
      
      // Prevent duplicate loads
      if (loadAttempted) return;
      setLoadAttempted(true);
      
      try {
        setIsLoading(true);
        console.log("Loading exam with ID:", examId);
        
        // First, get the exam details
        const { data: examData, error: examError } = await supabase
          .from('exams')
          .select('*')
          .eq('id', examId)
          .single();
          
        if (examError) {
          console.error("Error fetching exam:", examError);
          setError("Exam not found");
          setIsLoading(false);
          return;
        }
        
        if (!examData) {
          console.error(`Exam not found with ID: ${examId}`);
          setError("Exam not found");
          setIsLoading(false);
          return;
        }
        
        // Transform exam data to match our type
        const transformedExam = transformExamData(examData as ExamData);
        
        // Fetch question IDs from exam_questions table
        const { data: questionLinks, error: questionsError } = await supabase
          .from('exam_questions')
          .select('question_id, order_number')
          .eq('exam_id', examId)
          .order('order_number');
            
        if (questionsError) {
          console.error("Error fetching exam questions:", questionsError);
          setError("Failed to load exam questions");
          setIsLoading(false);
          return;
        }
        
        let foundQuestions: Question[] = [];
        
        if (questionLinks && questionLinks.length > 0) {
          console.log("Found question links in database:", questionLinks);
          
          // Extract question IDs and update the exam object
          const questionIds = questionLinks.map(q => q.question_id);
          transformedExam.questions = questionIds;
          
          // If we have question IDs but no questions array, fetch them directly
          if (questionIds.length > 0 && (!questions || questions.length === 0)) {
            console.log("Fetching questions directly from the database");
            const { data: questionsData, error: fetchQuestionsError } = await supabase
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
              
            if (fetchQuestionsError) {
              console.error("Error fetching questions:", fetchQuestionsError);
            } else if (questionsData) {
              foundQuestions = questionsData.map(q => ({
                id: q.id,
                text: q.text,
                type: q.type,
                difficultyLevel: q.difficulty_level,
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
              console.log(`Fetched ${foundQuestions.length} questions directly from DB`);
            }
          } else {
            // Find matching questions in our questions array
            foundQuestions = questions.filter(q => questionIds.includes(q.id));
            console.log(`Found ${foundQuestions.length} questions from local state`);
          }
        } else {
          console.log("No questions found in database for this exam");
          
          // If using question pool, try to extract questions from there
          if (transformedExam.useQuestionPool && transformedExam.questionPool) {
            console.log("Exam uses question pool:", transformedExam.questionPool);
            
            // Get all subject IDs from the question pool
            const poolSubjectIds = transformedExam.questionPool.subjects ?
              transformedExam.questionPool.subjects.map(subject => subject.subjectId) : [];
            
            if (poolSubjectIds.length > 0) {
              // Fetch questions directly from database based on subject IDs
              const { data: poolQuestions, error: poolError } = await supabase
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
                .in('subject_id', poolSubjectIds);
                
              if (poolError) {
                console.error("Error fetching pool questions:", poolError);
              } else if (poolQuestions && poolQuestions.length > 0) {
                console.log(`Found ${poolQuestions.length} questions from pool subjects`);
                
                // Transform questions to our Question type
                const availablePoolQuestions = poolQuestions.map(q => ({
                  id: q.id,
                  text: q.text,
                  type: q.type,
                  difficultyLevel: q.difficulty_level,
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
                
                // Take up to the specified number of questions for preview
                const totalQuestionsNeeded = transformedExam.questionPool.totalQuestions || 
                  (transformedExam.questionPool.subjects ? 
                    transformedExam.questionPool.subjects.reduce((sum, s) => sum + s.count, 0) : 0);
                  
                foundQuestions = availablePoolQuestions.slice(0, totalQuestionsNeeded);
                console.log(`Selected ${foundQuestions.length} questions from pool for preview`);
              }
            }
          }
        }
        
        // Try to get questions from the provided getExamWithQuestions function as a fallback
        if (foundQuestions.length === 0 && transformedExam) {
          const { examQuestions: fallbackQuestions } = getExamWithQuestions(examId, questions);
          if (fallbackQuestions && fallbackQuestions.length > 0) {
            console.log(`Found ${fallbackQuestions.length} questions from local state`);
            foundQuestions = fallbackQuestions;
          }
        }

        console.log(`Loaded exam: ${transformedExam.title} with ${foundQuestions.length} questions`);
        setExam(transformedExam);
        setExamQuestions(foundQuestions);
        setError(null);
      } catch (error) {
        console.error("Error loading exam:", error);
        setError("Failed to load exam");
      } finally {
        setIsLoading(false);
      }
    };

    loadExam();
  }, [examId, getExamWithQuestions, questions, loadAttempted]);

  return { exam, examQuestions, isLoading, error };
};
