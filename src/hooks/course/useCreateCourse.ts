
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { CourseFormData } from "@/types/course.types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useCreateCourse = (onSuccess: () => Promise<void>) => {
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();

  const createCourse = async (data: CourseFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Generate a unique ID for the course
      const courseId = uuidv4();
      
      // In development mode, if no userId is available, use a valid UUID format for testing
      const currentUserId = authState.user?.id || uuidv4();
      
      console.log("Creating course with instructor ID:", currentUserId);
      
      // Insert into Supabase
      const { error } = await supabase
        .from('courses')
        .insert({
          id: courseId,
          title: data.title,
          description: data.description,
          image_url: data.imageUrl,
          instructor_id: currentUserId,
          is_published: data.isPublished,
        });
      
      if (error) {
        throw error;
      }
      
      // Refresh courses from the database
      await onSuccess();
      toast.success("Course created successfully");
      return true;
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCourse,
    isLoading
  };
};
