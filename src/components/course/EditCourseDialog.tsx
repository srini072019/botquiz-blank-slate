
import { Dialog } from "@/components/ui/dialog";
import CourseDialogForm from "./CourseDialogForm";
import { Course, CourseFormData } from "@/types/course.types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import EnrollCandidatesDialog from "./EnrollCandidatesDialog";
import { UserPlus } from "lucide-react";

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
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  
  if (!editCourseId) return null;
  
  const course = courses.find(course => course.id === editCourseId);
  
  return (
    <>
      <Dialog open={!!editCourseId} onOpenChange={(open) => !open && onClose()}>
        <CourseDialogForm
          title="Edit Course"
          description="Update the details of this course."
          initialData={course}
          onSubmit={onUpdateCourse}
          isSubmitting={isLoading}
          additionalActions={
            course?.isPublished ? (
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsEnrollDialogOpen(true);
                }}
                className="mt-4"
              >
                <UserPlus size={16} className="mr-2" />
                Add Candidates
              </Button>
            ) : null
          }
        />
      </Dialog>
      
      {editCourseId && (
        <EnrollCandidatesDialog
          courseId={editCourseId}
          isOpen={isEnrollDialogOpen}
          onClose={() => setIsEnrollDialogOpen(false)}
        />
      )}
    </>
  );
};

export default EditCourseDialog;
