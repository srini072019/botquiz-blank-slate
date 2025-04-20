
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/types/course.types";

interface EnrollmentResult {
  success: boolean;
  message?: string;
}

export const useEnrollment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();

  const getEnrolledCourses = async (): Promise<Course[]> => {
    if (!authState.user) return [];
    
    try {
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
            updated_at
          )
        `)
        .eq('user_id', authState.user.id);

      if (error) throw error;

      const courses: Course[] = data
        .filter(item => item.course) // Filter out any null courses
        .map(({ course }) => ({
          id: course.id,
          title: course.title,
          description: course.description || "",
          imageUrl: course.image_url,
          instructorId: course.instructor_id,
          isPublished: course.is_published,
          createdAt: new Date(course.created_at),
          updatedAt: new Date(course.updated_at)
        }));

      return courses;
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      toast.error("Failed to fetch enrolled courses");
      return [];
    }
  };

  const enrollParticipants = async (courseId: string, emails: string[]): Promise<EnrollmentResult> => {
    if (!authState.user) {
      return {
        success: false,
        message: "You must be logged in to enroll participants"
      };
    }

    setIsLoading(true);
    try {
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .in('email', emails);

      if (userError) throw userError;

      if (!users || users.length === 0) {
        return {
          success: false,
          message: "No valid users found for the provided emails"
        };
      }

      const enrollments = users.map(user => ({
        course_id: courseId,
        user_id: user.id,
        enrolled_by: authState.user!.id
      }));

      const { error } = await supabase
        .from('course_enrollments')
        .insert(enrollments);

      if (error) throw error;
      
      toast.success("Participants enrolled successfully");
      return { success: true };
    } catch (error) {
      console.error("Error enrolling participants:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to enroll participants");
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getEnrolledCourses,
    enrollParticipants
  };
};
