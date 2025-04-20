
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InstructorLayout from "@/layouts/InstructorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit, Archive, UserPlus } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { useSubjects } from "@/hooks/useSubjects";
import { useQuestions } from "@/hooks/useQuestions";
import { useUpdateCourse } from "@/hooks/course/useUpdateCourse";
import SubjectList from "@/components/subject/SubjectList";
import ExamList from "@/components/exam/ExamList";
import { Dialog } from "@/components/ui/dialog";
import CourseDialogForm from "@/components/course/CourseDialogForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import EnrollCandidatesDialog from "@/components/course/EnrollCandidatesDialog";
import ParticipantEnrollment from "@/components/course/ParticipantEnrollment";
import { toast } from "sonner";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, getCourse } = useCourses();
  const { updateCourse, discontinueCourse, isLoading } = useUpdateCourse(async () => {
    // Refresh course data after update
    if (id) {
      const updatedCourse = getCourse(id);
      if (updatedCourse) {
        setCourse(updatedCourse);
      }
    }
  });
  const { subjects } = useSubjects();
  const { questions } = useQuestions();
  const [course, setCourse] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isParticipantEnrollDialogOpen, setIsParticipantEnrollDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const foundCourse = getCourse(id);
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        navigate(ROUTES.INSTRUCTOR_COURSES);
      }
    }
  }, [id, getCourse, navigate, courses]);

  const handleUpdateCourse = async (data: any) => {
    if (course && id) {
      const success = await updateCourse(id, data);
      
      if (success) {
        setIsEditDialogOpen(false);
        toast.success("Course updated successfully");
      }
    }
  };

  const handleDiscontinueCourse = async () => {
    if (course && id) {
      const success = await discontinueCourse(id);
      
      if (success) {
        toast.success("Course discontinued successfully");
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
              {course.isDiscontinued && (
                <Badge variant="destructive">Discontinued</Badge>
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
            {course.isPublished && !course.isDiscontinued && (
              <>
                <Button 
                  variant="outline"
                  className="text-amber-600 border-amber-600 hover:bg-amber-50"
                  onClick={handleDiscontinueCourse}
                  disabled={isLoading}
                >
                  <Archive size={16} className="mr-2" />
                  Discontinue
                </Button>
                <Button 
                  variant="default"
                  onClick={() => setIsEnrollDialogOpen(true)}
                >
                  <UserPlus size={16} className="mr-2" />
                  Add Candidates
                </Button>
                <Button 
                  variant="default"
                  onClick={() => setIsParticipantEnrollDialogOpen(true)}
                >
                  Add Participants
                </Button>
              </>
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

        {/* EnrollCandidatesDialog for adding candidates to the course */}
        <EnrollCandidatesDialog
          courseId={course.id}
          isOpen={isEnrollDialogOpen}
          onClose={() => setIsEnrollDialogOpen(false)}
        />

        {/* Dialog for editing course details */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <CourseDialogForm
            title="Edit Course"
            description="Update the details of this course."
            initialData={course}
            onSubmit={handleUpdateCourse}
            isSubmitting={isLoading}
          />
        </Dialog>

        {/* Dialog for enrolling participants */}
        <ParticipantEnrollment
          courseId={course.id}
          isOpen={isParticipantEnrollDialogOpen}
          onClose={() => setIsParticipantEnrollDialogOpen(false)}
        />
      </div>
    </InstructorLayout>
  );
};

export default CourseDetail;
