
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Course, CourseFormData } from "@/types/course.types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { transformCourseData } from "@/utils/courseUtils";
import { useCreateCourse } from "./course/useCreateCourse";
import { useUpdateCourse } from "./course/useUpdateCourse";
import { useDeleteCourse } from "./course/useDeleteCourse";
import { useUnpublishCourse } from "./course/useUnpublishCourse";

export const useCourses = (instructorId?: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();
  
  // Get the actual UUID of the current user
  const userId = authState.user?.id || instructorId;

  // Fetch courses on load
  useEffect(() => {
    fetchCourses();
  }, [userId]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('courses')
        .select('*, profiles!courses_instructor_id_fkey(*)');
      
      // Filter by instructor if provided
      if (userId) {
        query = query.eq('instructor_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Transform data to match our Course type
      const transformedCourses: Course[] = data.map(transformCourseData);
      
      setCourses(transformedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const { createCourse } = useCreateCourse(fetchCourses);
  const { updateCourse } = useUpdateCourse(fetchCourses);
  const { deleteCourse } = useDeleteCourse(courses, setCourses);
  const { unpublishCourse } = useUnpublishCourse(fetchCourses);

  const getCourse = (id: string): Course | undefined => {
    return courses.find(course => course.id === id);
  };

  return {
    courses,
    isLoading,
    createCourse,
    updateCourse,
    unpublishCourse,
    deleteCourse,
    getCourse,
    fetchCourses,
  };
};
