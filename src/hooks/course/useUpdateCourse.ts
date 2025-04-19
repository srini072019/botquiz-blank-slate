
import { useState } from "react";
import { toast } from "sonner";
import { CourseFormData } from "@/types/course.types";
import { supabase } from "@/integrations/supabase/client";

export const useUpdateCourse = (onSuccess: () => Promise<void>) => {
  const [isLoading, setIsLoading] = useState(false);

  const updateCourse = async (id: string, data: CourseFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('courses')
        .update({
          title: data.title,
          description: data.description,
          image_url: data.imageUrl,
          is_published: data.isPublished,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Refresh courses from the database
      await onSuccess();
      toast.success("Course updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateCourse,
    isLoading
  };
};
