
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import EnrolledCourse from "./EnrolledCourse";
import { useEnrollment } from "@/hooks/useEnrollment";
import { Course } from "@/types/course.types";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EnrolledCourseWithInstructor extends Course {
  instructorName: string;
}

const EnrolledCourses = () => {
  const [courses, setCourses] = useState<EnrolledCourseWithInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!authState.user?.id) return;
      
      try {
        setLoading(true);
        console.log("Fetching enrolled courses for user:", authState.user.id);
        
        // Directly fetch course enrollments with course details
        const { data, error } = await supabase
          .from('course_enrollments')
          .select(`
            course:course_id (
              id,
              title,
              description,
              image_url,
              instructor_id,
              is_published,
              created_at,
              updated_at,
              profiles:instructor_id (
                display_name
              )
            )
          `)
          .eq('user_id', authState.user.id);

        if (error) {
          console.error("Error fetching enrolled courses:", error);
          throw error;
        }

        console.log("Raw enrolled courses data:", data);
        
        // Transform the data into the required format
        const formattedCourses: EnrolledCourseWithInstructor[] = (data || [])
          .filter(item => item.course)
          .map(({ course }) => ({
            id: course.id,
            title: course.title,
            description: course.description || "",
            imageUrl: course.image_url,
            instructorId: course.instructor_id,
            instructorName: course.profiles?.display_name || "Unknown Instructor",
            isPublished: course.is_published,
            createdAt: new Date(course.created_at),
            updatedAt: new Date(course.updated_at)
          }));

        console.log("Formatted enrolled courses:", formattedCourses);
        setCourses(formattedCourses);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        toast.error("Failed to load enrolled courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [authState.user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Courses Available</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't been enrolled in any courses yet.</p>
        <p className="text-gray-600 dark:text-gray-400">Please contact your instructor for enrollment.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Courses</h2>
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
