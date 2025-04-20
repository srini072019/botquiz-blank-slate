
import { Course } from "@/types/course.types";
import CourseCard from "@/components/course/CourseCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useUpdateCourse } from "@/hooks/course/useUpdateCourse";

interface CourseTabContentProps {
  courses: Course[];
  onEditCourse: (courseId: string) => void;
  emptyMessage?: string;
}

const CourseTabContent = ({ 
  courses, 
  onEditCourse, 
  emptyMessage = "No courses found" 
}: CourseTabContentProps) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { discontinueCourse, isLoading } = useUpdateCourse(() => Promise.resolve());

  const handleDiscontinue = async () => {
    if (selectedCourse) {
      await discontinueCourse(selectedCourse.id);
      setSelectedCourse(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              actionButton={
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEditCourse(course.id)}
                  >
                    Edit
                  </Button>
                  <Link to={`/instructor/courses/${course.id}`}>
                    <Button variant="outline" size="sm">Manage</Button>
                  </Link>
                  {!course.isDiscontinued && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => setSelectedCourse(course)}
                    >
                      Discontinue
                    </Button>
                  )}
                </div>
              }
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discontinue Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discontinue this course? This will prevent new enrollments,
              but existing students will still have access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setSelectedCourse(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDiscontinue}
              disabled={isLoading}
            >
              {isLoading ? "Discontinuing..." : "Yes, discontinue course"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CourseTabContent;
