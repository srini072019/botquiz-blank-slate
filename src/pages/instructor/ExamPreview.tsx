
import { useParams, useNavigate } from "react-router-dom";
import { useQuestions } from "@/hooks/useQuestions";
import { useExams, useExam } from "@/hooks/useExams";
import InstructorLayout from "@/layouts/InstructorLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import ExamPage from "@/pages/candidate/ExamPage";

const ExamPreview = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { questions } = useQuestions();
  const { getExamWithQuestions } = useExams();
  const { exam, examQuestions, isLoading, error } = useExam(
    examId,
    getExamWithQuestions,
    questions
  );

  console.log("ExamPreview - exam:", exam);
  console.log("ExamPreview - examQuestions:", examQuestions);

  if (isLoading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </InstructorLayout>
    );
  }

  if (error || !exam) {
    return (
      <InstructorLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/instructor/exams")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Exam Preview</h1>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-center text-red-500">Error: {error || "Exam not found"}</p>
            <div className="mt-6 flex justify-center">
              <Button onClick={() => navigate("/instructor/exams")}>
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/instructor/exams")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Preview: {exam.title}</h1>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
          <p className="text-amber-600 font-medium">
            This is a preview of how candidates will see the exam. You can interact with the exam as if you were a candidate, but no results will be saved.
          </p>
        </div>
        
        {/* Pass the necessary props to ExamPage */}
        <ExamPage 
          isPreview={true} 
          previewExamId={exam.id}
          previewExam={exam}
          previewExamQuestions={examQuestions}
        />
      </div>
    </InstructorLayout>
  );
};

export default ExamPreview;
