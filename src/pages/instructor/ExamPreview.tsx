
import { useParams, useNavigate } from "react-router-dom";
import { useQuestions } from "@/hooks/useQuestions";
import { useExams, useExam } from "@/hooks/useExams";
import InstructorLayout from "@/layouts/InstructorLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ExamPreview from "@/components/exam/ExamPreview";
import { toast } from "sonner";

const ExamPreviewPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { questions, fetchQuestions } = useQuestions();
  const { getExamWithQuestions } = useExams();
  const [dataFetched, setDataFetched] = useState(false);
  
  // First fetch questions to ensure we have the latest data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!dataFetched) {
        await fetchQuestions();
        setDataFetched(true);
      }
    };
    
    loadInitialData();
  }, [fetchQuestions, dataFetched]);
  
  // Then use the useExam hook to get exam details and questions
  const { exam, examQuestions, isLoading, error } = useExam(
    examId,
    getExamWithQuestions,
    questions
  );

  const handleBackClick = useCallback(() => {
    navigate("/instructor/exams");
  }, [navigate]);

  console.log("ExamPreview - render with exam:", exam?.id);
  console.log("ExamPreview - questions count:", examQuestions?.length);
  
  if (error) {
    toast.error(error);
  }

  if (isLoading || !dataFetched) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </InstructorLayout>
    );
  }

  if (!exam) {
    return (
      <InstructorLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBackClick}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Exam Preview</h1>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-center text-red-500">Error: {error || "Exam not found"}</p>
            <div className="mt-6 flex justify-center">
              <Button onClick={handleBackClick}>
                Back to Exams
              </Button>
            </div>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Preview: {exam.title}</h1>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
          <p className="text-amber-600 font-medium">
            This is a preview of how the exam will appear to candidates.
          </p>
        </div>
        
        {/* Use our ExamPreview component */}
        <ExamPreview 
          questions={examQuestions} 
          useQuestionPool={exam.useQuestionPool}
          totalPoolQuestions={exam.questionPool?.totalQuestions}
        />
        
        <div className="mt-6 flex justify-end">
          <Button onClick={handleBackClick}>
            Back to Exams
          </Button>
        </div>
      </div>
    </InstructorLayout>
  );
};

export default ExamPreviewPage;
