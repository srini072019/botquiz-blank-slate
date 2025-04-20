
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
        <EnrolledCourses />
        <ExamsList />
      </div>
    </CandidateLayout>
  );
};

export default Dashboard;
