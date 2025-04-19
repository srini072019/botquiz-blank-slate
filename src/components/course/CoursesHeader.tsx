
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import CourseDialogForm from "./CourseDialogForm";
import { CourseFormData } from "@/types/course.types";

interface CoursesHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  onCreateCourse: (data: CourseFormData) => Promise<void>;
  isLoading: boolean;
}

const CoursesHeader = ({
  isDialogOpen,
  setIsDialogOpen,
  onCreateCourse,
  isLoading
}: CoursesHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Courses</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            <span>Create Course</span>
          </Button>
        </DialogTrigger>
        <CourseDialogForm
          title="Create New Course"
          description="Fill in the details to create a new course."
          onSubmit={onCreateCourse}
          isSubmitting={isLoading}
        />
      </Dialog>
    </div>
  );
};

export default CoursesHeader;
