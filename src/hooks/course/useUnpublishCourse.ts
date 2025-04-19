
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useUnpublishCourse = (onSuccess: () => Promise<void>) => {
  const [isLoading, setIsLoading] = useState(false);

  const unpublishCourse = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('courses')
        .update({
          is_published: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Refresh courses from the database
      await onSuccess();
      toast.success("Course unpublished successfully");
      return true;
    } catch (error) {
      console.error("Error unpublishing course:", error);
      toast.error("Failed to unpublish course");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    unpublishCourse,
    isLoading
  };
};
