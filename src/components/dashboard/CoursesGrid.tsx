
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";
import { Course } from "@/types/course.types";
import { NavigateFunction } from "react-router-dom";
import CourseCardContent from "./CourseCardContent";

interface CoursesGridProps {
  courses: Course[];
  isLoading: boolean;
  navigate: NavigateFunction;
}

const CoursesGrid = ({ courses, isLoading, navigate }: CoursesGridProps) => {
  const handleCourseClick = (courseId: string) => {
    navigate(`/instructor/courses/${courseId}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Published Courses</h2>
        <div className="flex gap-2">
          <Button 
            className="bg-assessify-primary hover:bg-assessify-primary/90"
            onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
          >
            Manage Courses
          </Button>
          <Link to={ROUTES.INSTRUCTOR_QUESTIONS}>
            <Button variant="outline">
              Manage Questions
            </Button>
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <p>Loading courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course) => (
              <CourseCardContent
                key={course.id}
                title={course.title}
                isPublished={course.isPublished}
                updatedAt={course.updatedAt}
                onClick={() => handleCourseClick(course.id)}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">No published courses found.</p>
              <Button 
                onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
                className="mt-4"
              >
                Create Course
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoursesGrid;
