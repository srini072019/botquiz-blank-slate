
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
  const { subjects, getSubject } = useSubjects();
  const { courses } = useCourses();
  const [subject, setSubject] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  
  useEffect(() => {
    if (id) {
      const foundSubject = getSubject(id);
      if (foundSubject) {
        setSubject(foundSubject);
        
        const relatedCourse = courses.find(c => c.id === foundSubject.courseId);
        if (relatedCourse) {
          setCourse(relatedCourse);
        }
      } else {
        // Subject not found, redirect
        navigate(ROUTES.INSTRUCTOR_SUBJECTS);
      }
    }
  }, [id, getSubject, courses, navigate]);

  if (!subject || !course) {
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-2"
              onClick={() => navigate(`${ROUTES.INSTRUCTOR_COURSES}/${course.id}`)}
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to {course.title}
            </Button>
            <h1 className="text-3xl font-bold">{subject.title}</h1>
            <p className="text-gray-500 mt-1">{subject.description}</p>
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
