
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InstructorLayout from "@/layouts/InstructorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExams } from "@/hooks/useExams";
import { useCourses } from "@/hooks/useCourses";
import { useQuestions } from "@/hooks/useQuestions";
import { useSubjects } from "@/hooks/useSubjects";
import ExamForm from "@/components/exam/ExamForm";
import { ArrowLeft } from "lucide-react";
import { ExamStatus } from "@/types/exam.types";

const CreateExamPage = () => {
  const navigate = useNavigate();
  const { courses } = useCourses();
  const { subjects, fetchSubjects } = useSubjects();
  const { questions, fetchQuestions } = useQuestions();
  const { createExam, isLoading } = useExams();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses]);

  const handleCreateExam = async (data: any) => {
    const success = await createExam(data);
    if (success) {
      navigate("/instructor/exams");
    }
  };

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/instructor/exams")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Create New Exam</h1>
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
              onSubmit={handleCreateExam}
              isSubmitting={isLoading}
              initialData={{ 
                status: ExamStatus.DRAFT 
              }}
              isEdit={false}
            />
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
};

export default CreateExamPage;
