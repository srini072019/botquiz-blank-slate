
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

    if (!emails || emails.length === 0) {
      return {
        success: false,
        message: "No emails provided for enrollment"
      };
    }

    setIsLoading(true);
    try {
      console.log("Enrolling participants with emails:", emails);
      
      // First, fetch the user IDs based on the emails
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', 
          supabase
            .from('auth.users')
            .select('id')
            .in('email', emails)
        );

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        return {
          success: false,
          message: "No valid users found for the provided emails"
        };
      }

      console.log("Found profiles:", profiles);

      // Create enrollment records for each user
      const enrollments = profiles.map(profile => ({
        course_id: courseId,
        user_id: profile.id,
        enrolled_by: authState.user!.id,
        enrolled_at: new Date().toISOString()
      }));

      const { error: enrollmentError } = await supabase
        .from('course_enrollments')
        .upsert(enrollments, { onConflict: 'user_id,course_id' });

      if (enrollmentError) {
        console.error("Error creating enrollments:", enrollmentError);
        throw enrollmentError;
      }
      
      toast.success(`Successfully enrolled ${profiles.length} participant(s)`);
      return { 
        success: true,
        message: `Successfully enrolled ${profiles.length} participant(s)`
      };
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
