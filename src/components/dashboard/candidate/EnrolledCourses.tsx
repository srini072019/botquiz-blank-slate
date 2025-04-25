import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import EnrolledCourse from "./EnrolledCourse";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Fixed import

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  imageUrl?: string;
}

const EnrolledCourses = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth(); // Use the imported useAuth hook

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!authState.isAuthenticated || !authState.user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('candidate_courses')
          .select(`
            course (
              id,
              title,
              description,
              image_url,
              instructor_id,
              instructor:profiles(full_name)
            )
          `)
          .eq('candidate_id', authState.user.id)
          .eq('is_enrolled', true);

        if (error) {
          console.error("Error fetching enrolled courses:", error);
          return;
        }

        if (data) {
          const enrolledCourses: EnrolledCourse[] = data.map(item => ({
            id: item.course?.id || 'unknown',
            title: item.course?.title || 'Unknown Course',
            description: item.course?.description || 'No description available',
            instructorName: item.course?.instructor?.full_name || 'Unknown Instructor',
            imageUrl: item.course?.image_url || undefined,
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
                id={course.id}
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
