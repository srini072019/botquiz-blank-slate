
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InstructorLayout from "@/layouts/InstructorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useSubjects } from "@/hooks/useSubjects";
import { useCourses } from "@/hooks/useCourses";
import QuestionList from "@/components/question/QuestionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";

const SubjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subjects, getSubject, fetchSubjects, courseSubjects } = useSubjects();
  const { courses } = useCourses();
  const [subject, setSubject] = useState<any>(null);
  const [primaryCourseId, setPrimaryCourseId] = useState<string | null>(null);
  
  useEffect(() => {
    // Make sure we fetch all subjects, including those without questions
    fetchSubjects();
  }, [fetchSubjects]);
  
  useEffect(() => {
    if (id && subjects.length > 0) {
      const foundSubject = getSubject(id);
      if (foundSubject) {
        setSubject(foundSubject);
        
        // Find the first course associated with this subject
        const firstCourseSubject = courseSubjects.find(cs => cs.subjectId === id);
        if (firstCourseSubject) {
          setPrimaryCourseId(firstCourseSubject.courseId);
        }
      } else {
        // Subject not found, redirect
        navigate(ROUTES.INSTRUCTOR_SUBJECTS);
      }
    }
  }, [id, getSubject, subjects, courseSubjects, navigate]);

  // Get the primary course object
  const primaryCourse = primaryCourseId ? 
    courses.find(c => c.id === primaryCourseId) : null;

  if (!subject) {
    return (
      <InstructorLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading subject details...</p>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            {primaryCourse && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mb-2"
                onClick={() => navigate(`${ROUTES.INSTRUCTOR_COURSES}/${primaryCourse.id}`)}
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to {primaryCourse.title}
              </Button>
            )}
            <h1 className="text-3xl font-bold">{subject.title}</h1>
            <p className="text-gray-500 mt-1">{subject.description}</p>
            
            {/* Show associated courses */}
            {subject.courses && subject.courses.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Linked to courses: </span>
                  {subject.courses.map(c => c.title).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="questions" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="questions">Questions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="questions">
                <QuestionList subjectId={subject.id} subjects={subjects} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
};

export default SubjectDetail;
