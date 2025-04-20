
import { Card } from "@/components/ui/card";
import { BookOpen, CalendarCheck, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    enrolledCourses: 0,
    upcomingExams: 0,
    completedExams: 0
  });
  const { authState } = useAuth();

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!authState.user?.id) return;

      // Fetch enrolled courses count
      const { count: enrolledCount } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authState.user.id);

      // Fetch upcoming exams count (exams user is assigned to that haven't been completed)
      const { count: upcomingCount } = await supabase
        .from('exam_candidate_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('candidate_id', authState.user.id)
        .eq('status', 'pending');

      // Fetch completed exams count
      const { count: completedCount } = await supabase
        .from('exam_candidate_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('candidate_id', authState.user.id)
        .eq('status', 'completed');

      setMetrics({
        enrolledCourses: enrolledCount || 0,
        upcomingExams: upcomingCount || 0,
        completedExams: completedCount || 0
      });
    };

    fetchMetrics();
  }, [authState.user?.id]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 bg-assessify-accent rounded-full">
            <BookOpen className="h-6 w-6 text-assessify-primary" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Enrolled Courses</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.enrolledCourses}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 bg-assessify-accent rounded-full">
            <CalendarCheck className="h-6 w-6 text-assessify-primary" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Exams</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.upcomingExams}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 bg-assessify-accent rounded-full">
            <CheckCircle className="h-6 w-6 text-assessify-primary" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Exams</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.completedExams}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardMetrics;
