
import { useState } from "react";
import { toast } from "sonner";
import { Course } from "@/types/course.types";

// Mock enrollment data
const mockEnrollments: Record<string, string[]> = {
  "candidate-1": ["course-1", "course-3"],
  "candidate-2": ["course-2"]
};

export const useEnrollment = (userId: string) => {
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(
    mockEnrollments[userId] || []
  );
  const [isLoading, setIsLoading] = useState(false);

  const enrollInCourse = async (courseId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with Supabase
      if (enrolledCourseIds.includes(courseId)) {
        toast.error("Already enrolled in this course");
        return false;
      }
      
      setEnrolledCourseIds([...enrolledCourseIds, courseId]);
      toast.success("Enrolled in course successfully");
      return true;
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast.error("Failed to enroll in course");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unenrollFromCourse = async (courseId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with Supabase
      if (!enrolledCourseIds.includes(courseId)) {
        toast.error("Not enrolled in this course");
        return false;
      }
      
      setEnrolledCourseIds(enrolledCourseIds.filter(id => id !== courseId));
      toast.success("Unenrolled from course successfully");
      return true;
    } catch (error) {
      console.error("Error unenrolling from course:", error);
      toast.error("Failed to unenroll from course");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isEnrolled = (courseId: string): boolean => {
    return enrolledCourseIds.includes(courseId);
  };

  return {
    enrolledCourseIds,
    isLoading,
    enrollInCourse,
    unenrollFromCourse,
    isEnrolled,
  };
};
