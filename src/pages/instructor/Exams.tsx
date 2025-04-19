
import { useState } from "react";
import { Link } from "react-router-dom";
import InstructorLayout from "@/layouts/InstructorLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import ExamList from "@/components/exam/ExamList";
import { useExams } from "@/hooks/useExams";
import { useCourses } from "@/hooks/useCourses";
import { useQuestions } from "@/hooks/useQuestions";

const ExamsPage = () => {
  const { courses } = useCourses();
  const { questions } = useQuestions();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // If no course is selected, select the first one
  if (courses.length > 0 && !selectedCourseId) {
    setSelectedCourseId(courses[0].id);
  }

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Exams</h1>
          <Button className="flex items-center gap-2" asChild>
            <Link to="/instructor/exams/create">
              <Plus size={18} />
              <span>Create Exam</span>
            </Link>
          </Button>
        </div>

        {courses.length > 0 ? (
          <div className="space-y-6">
            <Tabs defaultValue={courses[0]?.id} onValueChange={setSelectedCourseId}>
              <TabsList className="mb-4">
                {courses.map((course) => (
                  <TabsTrigger key={course.id} value={course.id}>
                    {course.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {courses.map((course) => (
                <TabsContent key={course.id} value={course.id}>
                  {selectedCourseId && (
                    <ExamList 
                      courseId={course.id} 
                      courses={courses}
                      questions={questions}
                    />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground mb-4">
              No courses found. Create a course first to manage exams.
            </p>
            <Button asChild>
              <Link to="/instructor/courses">Create Course</Link>
            </Button>
          </div>
        )}
      </div>
    </InstructorLayout>
  );
};

export default ExamsPage;
