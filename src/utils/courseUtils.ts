
import { Course } from "@/types/course.types";

// Transform database course data to match our Course type
export const transformCourseData = (courseData: any): Course => {
  // Ensure the role is a valid UserRole
  const roleFromDB = courseData.profiles?.role || 'instructor';
  const validRole = 
    (roleFromDB === 'admin' || roleFromDB === 'instructor' || roleFromDB === 'candidate') 
      ? roleFromDB 
      : 'instructor'; // Fallback to instructor if role is invalid
  
  return {
    id: courseData.id,
    title: courseData.title,
    description: courseData.description || "",
    imageUrl: courseData.image_url || "",
    instructorId: courseData.instructor_id,
    instructor: courseData.profiles ? {
      id: courseData.instructor_id,
      displayName: courseData.profiles.display_name || "",
      email: courseData.profiles.display_name || "unknown@example.com", // Fallback email
      role: validRole,
      createdAt: new Date(courseData.created_at), // Use course creation date as fallback
    } : undefined,
    createdAt: new Date(courseData.created_at),
    updatedAt: new Date(courseData.updated_at),
    isPublished: courseData.is_published,
    enrollmentCount: 0, // This will need to come from an enrollments count query
  };
};
