
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InstructorLayout from "@/layouts/InstructorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit, Archive } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { useSubjects } from "@/hooks/useSubjects";
import { useQuestions } from "@/hooks/useQuestions";
import SubjectList from "@/components/subject/SubjectList";
import ExamList from "@/components/exam/ExamList";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CourseForm from "@/components/course/CourseForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, getCourse, updateCourse, unpublishCourse } = useCourses();
  const { subjects } = useSubjects();
  const { questions } = useQuestions();
  const [course, setCourse] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (id) {
      const foundCourse = getCourse(id);
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        // Course not found, redirect
        navigate(ROUTES.INSTRUCTOR_COURSES);
      }
    }
  }, [id, getCourse, navigate]);

  const handleUpdateCourse = async (data: any) => {
    if (course) {
      setIsSubmitting(true);
      const success = await updateCourse(course.id, data);
      setIsSubmitting(false);
      
      if (success) {
        setIsEditDialogOpen(false);
        // Update the local state with the new course data
        setCourse({ ...course, ...data });
      }
    }
  };

  const handleUnpublishCourse = async () => {
    if (course) {
      setIsSubmitting(true);
      const success = await unpublishCourse(course.id);
      setIsSubmitting(false);
      
      if (success) {
        // Update the local state with the new published status
        setCourse({ ...course, isPublished: false });
      }
    }
  };

  if (!course) {
    return (
      <InstructorLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading course details...</p>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-2"
              onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Courses
            </Button>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              {course.isPublished ? (
                <Badge className="bg-green-100 text-green-800">Published</Badge>
              ) : (
                <Badge variant="outline">Draft</Badge>
              )}
            </div>
            <p className="text-gray-500 mt-1">{course.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              Last updated: {formatDate(course.updatedAt)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit size={16} className="mr-2" />
              Edit Course
            </Button>
            {course.isPublished && (
              <Button 
                variant="outline"
                className="text-amber-600 border-amber-600 hover:bg-amber-50"
                onClick={handleUnpublishCourse}
                disabled={isSubmitting}
              >
                <Archive size={16} className="mr-2" />
                Unpublish
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="subjects" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                <TabsTrigger value="exams">Exams</TabsTrigger>
              </TabsList>
              
              <TabsContent value="subjects">
                <SubjectList courseId={course.id} courses={courses} />
              </TabsContent>
              
              <TabsContent value="exams">
                <ExamList courseId={course.id} courses={courses} questions={questions} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the details of this course.
            </DialogDescription>
          </DialogHeader>
          <CourseForm 
            initialData={{
              title: course.title,
              description: course.description,
              imageUrl: course.imageUrl,
              isPublished: course.isPublished,
            }}
            onSubmit={handleUpdateCourse}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </InstructorLayout>
  );
};

export default CourseDetail;
