
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuestions } from "@/hooks/useQuestions";
import { useExams, useExam } from "@/hooks/useExams";
import { useExamSession } from "@/hooks/useExamSession";
import { useAuth } from "@/context/AuthContext";
import ExamTaking from "@/components/exam/ExamTaking";
import ExamResults from "@/components/exam/ExamResults";
import CandidateLayout from "@/layouts/CandidateLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExamResult, ExamSession, ExamSessionStatus } from "@/types/exam-session.types";
import { Question } from "@/types/question.types";
import { Exam } from "@/types/exam.types";
import { Loader2, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

interface ExamPageProps {
  isPreview?: boolean;
  previewExamId?: string;
  previewExam?: Exam;
  previewExamQuestions?: Question[];
}

const ExamPage = ({ isPreview = false, previewExamId, previewExam, previewExamQuestions }: ExamPageProps) => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { getExamWithQuestions } = useExams();
  const { questions } = useQuestions();
  const { 
    startExam, 
    saveAnswer, 
    navigateQuestion, 
    submitExam, 
    getExamSession 
  } = useExamSession();

  // Use preview data if in preview mode, otherwise fetch from API
  const actualExamId = isPreview ? previewExamId : examId;
  
  const { exam: fetchedExam, examQuestions: fetchedExamQuestions, isLoading, error } = useExam(
    isPreview ? undefined : examId,
    getExamWithQuestions,
    questions
  );

  // Use preview data or fetched data
  const exam = isPreview ? previewExam : fetchedExam;
  const examQuestions = isPreview ? previewExamQuestions || [] : fetchedExamQuestions;

  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  // Only check auth if not in preview mode
  useEffect(() => {
    if (!isPreview && !authState.isLoading && !authState.isAuthenticated) {
      toast.error("You must be logged in to access this page");
      navigate("/login", { state: { from: `/candidate/exams/${examId}` } });
    }
  }, [authState.isAuthenticated, authState.isLoading, isPreview, examId, navigate]);

  const handleStartExam = async () => {
    if (!exam) return;

    if (isPreview) {
      const mockSession: ExamSession = {
        id: 'preview',
        examId: exam.id,
        candidateId: 'preview',
        startedAt: new Date(),
        answers: [],
        currentQuestionIndex: 0,
        expiresAt: new Date(Date.now() + exam.timeLimit * 60 * 1000),
        status: ExamSessionStatus.IN_PROGRESS,
      };
      setExamSession(mockSession);
      return;
    }

    if (!authState.user) {
      toast.error("You must be logged in to take an exam");
      navigate("/login", { state: { from: `/candidate/exams/${examId}` } });
      return;
    }

    try {
      const session = await startExam(
        exam.id,
        authState.user.id,
        exam.timeLimit
      );

      if (session) {
        setExamSession(session);
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Failed to start exam");
    }
  };

  const handleSaveAnswer = async (questionId: string, selectedOptions: string[]) => {
    if (!examSession) return false;
    
    if (isPreview) {
      setExamSession(prev => {
        if (!prev) return prev;
        const answers = [...prev.answers];
        const existingIndex = answers.findIndex(a => a.questionId === questionId);
        
        if (existingIndex >= 0) {
          answers[existingIndex] = { questionId, selectedOptions };
        } else {
          answers.push({ questionId, selectedOptions });
        }
        
        return { ...prev, answers };
      });
      return true;
    }
    
    return await saveAnswer(examSession.id, questionId, selectedOptions);
  };

  const handleNavigate = async (newIndex: number) => {
    if (!examSession) return false;
    
    if (isPreview) {
      setExamSession(prev => prev ? { ...prev, currentQuestionIndex: newIndex } : null);
      return true;
    }
    
    const success = await navigateQuestion(examSession.id, newIndex);
    if (success) {
      const updatedSession = getExamSession(examSession.id);
      if (updatedSession) {
        setExamSession(updatedSession);
      }
    }
    return success;
  };

  const handleSubmit = async () => {
    if (!examSession || !exam) return;
    
    if (isPreview) {
      toast.success("Preview completed");
      navigate("/instructor/exams");
      return;
    }
    
    try {
      const result = await submitExam(examSession.id, exam, examQuestions);
      if (result) {
        setExamResult(result);
        toast.success("Exam submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam");
    }
  };

  // In preview mode, skip loading state and just render a placeholder if no data yet
  if (!isPreview && isLoading) {
    return (
      <CandidateLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </CandidateLayout>
    );
  }

  // Only show error in non-preview mode
  if (!isPreview && (error || !exam)) {
    return (
      <CandidateLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Exam Not Found</h1>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-center text-red-500">Error: {error || "Exam not found"}</p>
            <div className="mt-6 flex justify-center">
              <Button onClick={() => navigate("/candidate/exams")}>
                Back to Exams
              </Button>
            </div>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  // If we have results, show them
  if (examResult) {
    return (
      <CandidateLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">{exam?.title} - Results</h1>
          <ExamResults result={examResult} />
          <div className="mt-6 flex justify-end">
            <Button onClick={() => navigate("/candidate/exams")}>
              Back to Exams
            </Button>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  // Exit early if we don't have an exam in preview mode
  if (isPreview && !exam) {
    console.error("No exam data available for preview");
    return (
      <CandidateLayout>
        <div className="container mx-auto py-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-center text-red-500">Error: No exam data available for preview</p>
            <div className="mt-6 flex justify-center">
              <Button onClick={() => navigate("/instructor/exams")}>
                Back to Exams
              </Button>
            </div>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  // If no exam session yet, show the exam info screen
  if (!examSession) {
    return (
      <CandidateLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">{exam?.title}</h1>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Exam Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Time Limit</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <p>{exam?.timeLimit} minutes</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Questions</p>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <p>{examQuestions.length}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passing Score</p>
                <p>{exam?.passingScore}%</p>
              </div>
              {exam?.startDate && (
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p>
                    {format(new Date(exam.startDate), "MMM dd, yyyy")}
                    {exam.endDate && ` - ${format(new Date(exam.endDate), "MMM dd, yyyy")}`}
                  </p>
                </div>
              )}
            </div>
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Instructions</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>You have {exam?.timeLimit} minutes to complete the exam.</li>
                <li>You must score at least {exam?.passingScore}% to pass.</li>
                <li>The exam consists of {examQuestions.length} questions.</li>
                <li>Read each question carefully before answering.</li>
                <li>You can navigate between questions during the exam.</li>
                <li>You can only submit the exam once.</li>
              </ul>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleStartExam}>
                {isPreview ? "Start Preview" : "Start Exam"}
              </Button>
            </div>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  // Finally render the exam taking component
  return (
    <CandidateLayout>
      <ExamTaking
        examSession={examSession}
        questions={examQuestions}
        onSaveAnswer={handleSaveAnswer}
        onNavigate={handleNavigate}
        onSubmit={handleSubmit}
        isPreview={isPreview}
      />
    </CandidateLayout>
  );
};

export default ExamPage;
