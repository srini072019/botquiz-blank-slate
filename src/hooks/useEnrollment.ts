import { useState, useEffect } from "react";
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

      // Ensure data is an array before mapping
      const courses: Course[] = (data || [])
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
      
      // Query eligible_candidates view which contains user emails
      const { data: candidates, error: candidatesError } = await supabase
        .from('eligible_candidates')
        .select('id, display_name, email')
        .in('email', emails);

      if (candidatesError) {
        console.error("Error fetching candidates:", candidatesError);
        throw candidatesError;
      }

      // Ensure candidates is an array
      if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
        return {
          success: false,
          message: "No valid users found for the provided emails"
        };
      }

      console.log("Found candidates:", candidates);

      // Create enrollment records for each user
      const enrollments = candidates.map(candidate => ({
        course_id: courseId,
        user_id: candidate.id,
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
      
      toast.success(`Successfully enrolled ${candidates.length} participant(s)`);
      return { 
        success: true,
        message: `Successfully enrolled ${candidates.length} participant(s)`
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

  useEffect(() => {
    if (!authState.user?.id) return;

    // Subscribe to changes in course enrollments
    const channel = supabase
      .channel('enrollment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'course_enrollments',
          filter: `user_id=eq.${authState.user.id}`
        },
        async () => {
          // Refresh the enrolled courses data
          const courses = await getEnrolledCourses();
          // You'll need to implement a callback to update the courses in the UI
          console.log('Course enrollments updated:', courses);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authState.user?.id]);

  return {
    isLoading,
    getEnrolledCourses,
    enrollParticipants
  };
};
