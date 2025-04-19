
import { useState } from "react";
import InstructorLayout from "@/layouts/InstructorLayout";
import { useCourses } from "@/hooks/useCourses";
import { CourseFormData } from "@/types/course.types";
import { useAuth } from "@/context/AuthContext";
import CourseTabs from "@/components/course/CourseTabs";
import CoursesHeader from "@/components/course/CoursesHeader";
import EditCourseDialog from "@/components/course/EditCourseDialog";

const InstructorCourses = () => {
  const { authState } = useAuth();
  const userId = authState.user?.id;
  const { courses, createCourse, updateCourse, isLoading } = useCourses(userId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);

  const handleCreateCourse = async (data: CourseFormData) => {
    await createCourse(data);
    setIsDialogOpen(false);
  };

  const handleEditCourse = (courseId: string) => {
    setEditCourseId(courseId);
  };

  const handleUpdateCourse = async (data: CourseFormData) => {
    if (editCourseId) {
      await updateCourse(editCourseId, data);
      setEditCourseId(null);
    }
  };

  const publishedCourses = courses.filter(course => course.isPublished);
  const draftCourses = courses.filter(course => !course.isPublished);

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <CoursesHeader 
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          onCreateCourse={handleCreateCourse}
          isLoading={isLoading}
        />

        <CourseTabs 
          courses={courses}
          publishedCourses={publishedCourses}
          draftCourses={draftCourses}
          onEditCourse={handleEditCourse}
        />
        
        <EditCourseDialog
          editCourseId={editCourseId}
          courses={courses}
          isLoading={isLoading}
          onClose={() => setEditCourseId(null)}
          onUpdateCourse={handleUpdateCourse}
        />
      </div>
    </InstructorLayout>
  );
};

export default InstructorCourses;
