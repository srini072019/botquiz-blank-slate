
import { useState, useEffect } from "react";
import { Exam } from "@/types/exam.types";
import { Question } from "@/types/question.types";
import { toast } from "sonner";
import { UseExamResult } from "./types/exam.types";
import { transformExamData } from "./utils/transformExam";
import { 
  fetchExamData, 
  fetchExamQuestions, 
  fetchQuestionsByIds,
  fetchQuestionsBySubjects 
} from "./api/fetchExamData";

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

      if (loadAttempted) return;
      setLoadAttempted(true);

      try {
        setIsLoading(true);
        console.log("Loading exam with ID:", examId);

        // Fetch exam data
        const { examData, error: examError } = await fetchExamData(examId);
        if (examError || !examData) {
          setError("Exam not found");
          setIsLoading(false);
          return;
        }

        // Transform exam data
        const transformedExam = transformExamData(examData);

        // Fetch question links
        const { questionLinks, error: questionsError } = await fetchExamQuestions(examId);
        if (questionsError) {
          setError("Failed to load exam questions");
          setIsLoading(false);
          return;
        }

        let foundQuestions: Question[] = [];

        if (questionLinks && questionLinks.length > 0) {
          console.log("Found question links in database:", questionLinks);
          const questionIds = questionLinks.map(q => q.question_id);
          transformedExam.questions = questionIds;

          if (questionIds.length > 0 && (!questions || questions.length === 0)) {
            const { questions: fetchedQuestions } = await fetchQuestionsByIds(questionIds);
            if (fetchedQuestions) {
              foundQuestions = fetchedQuestions;
              console.log(`Fetched ${foundQuestions.length} questions directly from DB`);
            }
          } else {
            foundQuestions = questions.filter(q => questionIds.includes(q.id));
            console.log(`Found ${foundQuestions.length} questions from local state`);
          }
        } else if (transformedExam.useQuestionPool && transformedExam.questionPool) {
          console.log("Exam uses question pool:", transformedExam.questionPool);
          
          const poolSubjectIds = transformedExam.questionPool.subjects ?
            transformedExam.questionPool.subjects.map(subject => subject.subjectId) : [];

          if (poolSubjectIds.length > 0) {
            const { questions: poolQuestions } = await fetchQuestionsBySubjects(poolSubjectIds);
            
            if (poolQuestions && poolQuestions.length > 0) {
              console.log(`Found ${poolQuestions.length} questions from pool subjects`);
              
              const totalQuestionsNeeded = transformedExam.questionPool.totalQuestions || 
                (transformedExam.questionPool.subjects ? 
                  transformedExam.questionPool.subjects.reduce((sum, s) => sum + s.count, 0) : 0);
                
              foundQuestions = poolQuestions.slice(0, totalQuestionsNeeded);
              console.log(`Selected ${foundQuestions.length} questions from pool for preview`);
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
