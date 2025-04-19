
import { useEffect } from "react";
import InstructorLayout from "@/layouts/InstructorLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCourses } from "@/hooks/useCourses";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CourseStats from "@/components/dashboard/CourseStats";
import CoursesGrid from "@/components/dashboard/CoursesGrid";
import QuickLinks from "@/components/dashboard/QuickLinks";

const Dashboard = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  // Use the courses hook to get real data
  const { courses, isLoading, fetchCourses } = useCourses(authState.user?.id);
  
  // Fetch courses when component mounts
  useEffect(() => {
    fetchCourses();
  }, []);

  // Only show published courses on the dashboard
  const publishedCourses = courses.filter(course => course.isPublished);

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <DashboardHeader 
          userName={authState.user?.displayName || 'Instructor'} 
          userRole={authState.user?.role || 'instructor'} 
        />

        <CourseStats courses={publishedCourses} />

        <CoursesGrid 
          courses={publishedCourses}
          isLoading={isLoading}
          navigate={navigate}
        />

        <QuickLinks navigate={navigate} />
      </div>
    </InstructorLayout>
  );
};

export default Dashboard;
