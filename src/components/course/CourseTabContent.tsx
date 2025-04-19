
import { Course } from "@/types/course.types";
import CourseCard from "@/components/course/CourseCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

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
  return (
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
  );
};

export default CourseTabContent;
