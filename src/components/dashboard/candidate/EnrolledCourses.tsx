
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import EnrolledCourse from "./EnrolledCourse";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface EnrolledCourseData {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  imageUrl?: string;
}

const EnrolledCourses = () => {
  const [courses, setCourses] = useState<EnrolledCourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!authState.isAuthenticated || !authState.user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Query the course_enrollments table to get courses the user is enrolled in
        const { data, error } = await supabase
          .from('course_enrollments')
          .select(`
            course_id,
            courses:course_id (
              id,
              title,
              description,
              image_url,
              instructor_id,
              profiles:instructor_id (
                display_name
              )
            )
          `)
          .eq('user_id', authState.user.id);

        if (error) {
          console.error("Error fetching enrolled courses:", error);
          return;
        }

        if (data) {
          const enrolledCourses: EnrolledCourseData[] = data
            .filter(item => item.courses) // Filter out any null courses
            .map(item => ({
              id: item.courses?.id || 'unknown',
              title: item.courses?.title || 'Unknown Course',
              description: item.courses?.description || 'No description available',
              instructorName: item.courses?.profiles?.display_name || 'Unknown Instructor',
              imageUrl: item.courses?.image_url || undefined,
            }));
          
          setCourses(enrolledCourses);
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [authState.isAuthenticated, authState.user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading courses...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Enrolled Courses</h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <EnrolledCourse
                key={course.id}
                title={course.title}
                description={course.description}
                instructorName={course.instructorName}
                imageUrl={course.imageUrl}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Not enrolled in any courses yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EnrolledCourses;
