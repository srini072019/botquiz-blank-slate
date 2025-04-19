
import { Dialog } from "@/components/ui/dialog";
import CourseDialogForm from "./CourseDialogForm";
import { Course, CourseFormData } from "@/types/course.types";

interface EditCourseDialogProps {
  editCourseId: string | null;
  courses: Course[];
  isLoading: boolean;
  onClose: () => void;
  onUpdateCourse: (data: CourseFormData) => Promise<void>;
}

const EditCourseDialog = ({
  editCourseId,
  courses,
  isLoading,
  onClose,
  onUpdateCourse
}: EditCourseDialogProps) => {
  if (!editCourseId) return null;
  
  return (
    <Dialog open={!!editCourseId} onOpenChange={(open) => !open && onClose()}>
      <CourseDialogForm
        title="Edit Course"
        description="Update the details of this course."
        initialData={courses.find(course => course.id === editCourseId)}
        onSubmit={onUpdateCourse}
        isSubmitting={isLoading}
      />
    </Dialog>
  );
};

export default EditCourseDialog;
