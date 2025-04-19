
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import CandidateLayout from "@/layouts/CandidateLayout";
import { useAuth } from "@/context/AuthContext";
import { UserCheck } from "lucide-react";
import DashboardMetrics from "@/components/dashboard/candidate/DashboardMetrics";
import EnrolledCourses from "@/components/dashboard/candidate/EnrolledCourses";
import ExamsList from "@/components/dashboard/candidate/ExamsList";

const Dashboard = () => {
  const { authState } = useAuth();
  const userDisplayName = authState.user?.displayName || 'Student';

  const [enrolledCourses] = useState([
    {
      title: "Introduction to Computer Science",
      instructor: "Dr. Jane Smith",
      progress: 65,
      nextExam: {
        title: "Data Structures Quiz",
        date: "Apr 12, 2025 • 10:00 AM"
      }
    },
    {
      title: "Advanced Mathematics",
      instructor: "Prof. Robert Johnson",
      progress: 42,
      nextExam: {
        title: "Calculus Mid-term",
        date: "Apr 18, 2025 • 2:00 PM"
      }
    },
    {
      title: "English Literature",
      instructor: "Dr. Emily Williams",
      progress: 88,
    },
  ]);

  const [upcomingExams] = useState([
    {
      title: "Data Structures Quiz",
      course: "Introduction to Computer Science",
      date: "Apr 12, 2025",
      duration: "45 minutes",
      status: 'scheduled' as const
    },
    {
      title: "Calculus Mid-term",
      course: "Advanced Mathematics",
      date: "Apr 18, 2025",
      duration: "120 minutes",
      status: 'scheduled' as const
    },
    {
      title: "Programming Fundamentals",
      course: "Introduction to Computer Science",
      date: "Apr 8, 2025",
      duration: "60 minutes",
      status: 'available' as const
    },
    {
      title: "Literary Analysis",
      course: "English Literature",
      date: "Apr 5, 2025",
      duration: "90 minutes",
      status: 'completed' as const
    },
  ]);

  return (
    <CandidateLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Dashboard</h1>
          <div className="flex items-center mt-2">
            <UserCheck className="h-5 w-5 text-assessify-primary mr-2" />
            <p className="text-gray-600 dark:text-gray-400">
              Welcome, <span className="font-semibold">{userDisplayName}</span> - 
              <span className="bg-assessify-accent text-assessify-primary px-2 py-0.5 rounded-full text-sm font-medium">
                Candidate
              </span>
            </p>
          </div>
        </div>

        <DashboardMetrics />
        <EnrolledCourses courses={enrolledCourses} />
        <ExamsList exams={upcomingExams} />
      </div>
    </CandidateLayout>
  );
};

export default Dashboard;
