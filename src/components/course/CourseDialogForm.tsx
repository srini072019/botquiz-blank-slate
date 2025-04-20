
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CourseForm from "@/components/course/CourseForm";
import { Course, CourseFormData } from "@/types/course.types";
import { ReactNode } from "react";

interface CourseDialogFormProps {
  title: string;
  description: string;
  initialData?: Course;
  onSubmit: (data: CourseFormData) => Promise<void>;
  isSubmitting: boolean;
  additionalActions?: ReactNode;
}

const CourseDialogForm = ({
  title,
  description,
  initialData,
  onSubmit,
  isSubmitting,
  additionalActions
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
      {additionalActions}
    </DialogContent>
  );
};

export default CourseDialogForm;
