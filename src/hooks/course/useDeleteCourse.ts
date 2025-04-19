
import { useState, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Course } from "@/types/course.types";
import { supabase } from "@/integrations/supabase/client";

export const useDeleteCourse = (
  courses: Course[], 
  setCourses: Dispatch<SetStateAction<Course[]>>
) => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteCourse = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const filteredCourses = courses.filter(course => course.id !== id);
      setCourses(filteredCourses);
      toast.success("Course deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteCourse,
    isLoading
  };
};
