
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import EnrolledCourse from "./EnrolledCourse";

interface EnrolledCoursesProps {
  courses: Array<{
    title: string;
    instructor: string;
    progress: number;
    nextExam?: {
      title: string;
      date: string;
    };
  }>;
}

const EnrolledCourses = ({ courses }: EnrolledCoursesProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Courses</h2>
        <Button variant="outline" asChild>
          <Link to="#">Browse All Courses</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <EnrolledCourse
            key={index}
            title={course.title}
            instructor={course.instructor}
            progress={course.progress}
            nextExam={course.nextExam}
          />
        ))}
      </div>
    </div>
  );
};

export default EnrolledCourses;
