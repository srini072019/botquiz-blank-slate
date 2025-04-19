
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CourseForm from "@/components/course/CourseForm";
import { Course, CourseFormData } from "@/types/course.types";

interface CourseDialogFormProps {
  title: string;
  description: string;
  initialData?: Course;
  onSubmit: (data: CourseFormData) => Promise<void>;
  isSubmitting: boolean;
}

const CourseDialogForm = ({
  title,
  description,
  initialData,
  onSubmit,
  isSubmitting
}: CourseDialogFormProps) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {description}
        </DialogDescription>
      </DialogHeader>
      <CourseForm
        initialData={initialData}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </DialogContent>
  );
};

export default CourseDialogForm;
