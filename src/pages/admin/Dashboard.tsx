
import { useState } from "react";
import { Card } from "@/components/ui/card";
import AdminLayout from "@/layouts/AdminLayout";
import { Grid, Users, BookOpen, FileSpreadsheet, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className="p-2 bg-assessify-accent rounded-md">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </Card>
  );
};

const Dashboard = () => {
  const { authState } = useAuth();
  const userDisplayName = authState.user?.displayName || 'Admin';
  const userRole = authState.user?.role || 'admin';

  // Mock data - will be replaced with actual data from Supabase
  const [stats] = useState([
    {
      title: "Total Users",
      value: 2560,
      description: "245 new users in the last month",
      icon: <Users size={24} className="text-assessify-primary" />,
    },
    {
      title: "Active Courses",
      value: 189,
      description: "12 courses added this month",
      icon: <BookOpen size={24} className="text-assessify-primary" />,
    },
    {
      title: "Exams Conducted",
      value: 450,
      description: "86 exams conducted this month",
      icon: <FileSpreadsheet size={24} className="text-assessify-primary" />,
    },
    {
      title: "Active Subjects",
      value: 352,
      description: "34 subjects added this month",
      icon: <Grid size={24} className="text-assessify-primary" />,
    },
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center mt-2">
            <UserCheck className="h-5 w-5 text-assessify-primary mr-2" />
            <p className="text-gray-600 dark:text-gray-400">
              Welcome, <span className="font-semibold">{userDisplayName}</span> - 
              <span className="bg-assessify-accent text-assessify-primary px-2 py-0.5 rounded-full text-sm font-medium ml-2">{userRole}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="mr-4 p-2 bg-assessify-accent rounded-full">
                <Users size={16} className="text-assessify-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">New instructor registered</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="mr-4 p-2 bg-assessify-accent rounded-full">
                <BookOpen size={16} className="text-assessify-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">New course created: Advanced Mathematics</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">6 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="mr-4 p-2 bg-assessify-accent rounded-full">
                <FileSpreadsheet size={16} className="text-assessify-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Exam completed: Introduction to Biology</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
