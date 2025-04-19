
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InstructorLayout from "@/layouts/InstructorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExams } from "@/hooks/useExams";
import { useCourses } from "@/hooks/useCourses";
import { useQuestions } from "@/hooks/useQuestions";
import { useSubjects } from "@/hooks/useSubjects";
import ExamForm from "@/components/exam/ExamForm";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const EditExamPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { courses } = useCourses();
  const { subjects, fetchSubjects } = useSubjects();
  const { questions, fetchQuestions } = useQuestions();
  const { exams, updateExam, isLoading, fetchExams } = useExams();
  
  useEffect(() => {
    fetchSubjects();
    fetchQuestions();
    fetchExams();
  }, []);

  const exam = exams.find(e => e.id === examId);

  useEffect(() => {
    if (!exam && !isLoading && exams.length > 0) {
      toast.error("Exam not found");
      navigate("/instructor/exams");
    }
  }, [exam, exams, isLoading]);

  const handleUpdateExam = async (data: any) => {
    if (examId) {
      const success = await updateExam(examId, data);
      if (success) {
        navigate("/instructor/exams");
      }
    }
  };

  if (!exam) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <p>Loading exam...</p>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/instructor/exams")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Edit Exam</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ExamForm
              courses={courses}
              questions={questions}
              subjects={subjects}
              onSubmit={handleUpdateExam}
              isSubmitting={isLoading}
              initialData={{
                title: exam.title,
                description: exam.description,
                courseId: exam.courseId,
                timeLimit: exam.timeLimit,
                passingScore: exam.passingScore,
                shuffleQuestions: exam.shuffleQuestions,
                status: exam.status,
                questions: exam.questions,
                startDate: exam.startDate,
                endDate: exam.endDate,
                useQuestionPool: exam.useQuestionPool,
                questionPool: exam.questionPool,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
};

export default EditExamPage;
