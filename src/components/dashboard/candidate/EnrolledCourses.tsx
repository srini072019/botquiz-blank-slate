
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import EnrolledCourse from "./EnrolledCourse";
import { useEnrollment } from "@/hooks/useEnrollment";
import { Course } from "@/types/course.types";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EnrolledCourseWithInstructor extends Course {
  instructorName: string;
}

const EnrolledCourses = () => {
  const [courses, setCourses] = useState<EnrolledCourseWithInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const { getEnrolledCourses } = useEnrollment();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const enrolledCourses = await getEnrolledCourses();
        
        // Fetch instructor names for each course
        const coursesWithInstructors = await Promise.all(
          enrolledCourses.map(async (course) => {
            const { data: instructorData } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', course.instructorId)
              .single();

            return {
              ...course,
              instructorName: instructorData?.display_name || 'Unknown Instructor'
            };
          })
        );

        setCourses(coursesWithInstructors);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Courses Available</h2>
        <p className="text-gray-600 mb-4">You haven't been enrolled in any courses yet.</p>
        <p className="text-gray-600">Please contact your instructor for enrollment.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Your Courses</h2>
        <Button variant="outline" asChild>
          <Link to="/candidate/courses">View All Courses</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <EnrolledCourse
            key={course.id}
            title={course.title}
            instructor={course.instructorName}
            progress={0}
          />
        ))}
      </div>
    </div>
  );
};

export default EnrolledCourses;
