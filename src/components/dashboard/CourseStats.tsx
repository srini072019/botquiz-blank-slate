
import { Card } from "@/components/ui/card";
import { BookOpen, FileSpreadsheet, Users, CheckCircle } from "lucide-react";
import { Course } from "@/types/course.types";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => {
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
    </Card>
  );
};

interface CourseStatsProps {
  courses: Course[];
}

const CourseStats = ({ courses }: CourseStatsProps) => {
  // Calculate stats based on real data
  const stats = [
    {
      title: "Published Courses",
      value: courses.length,
      icon: <BookOpen size={24} className="text-assessify-primary" />,
    },
    {
      title: "Total Enrollments",
      value: courses.reduce((total, course) => total + (course.enrollmentCount || 0), 0),
      icon: <FileSpreadsheet size={24} className="text-assessify-primary" />,
    },
    {
      title: "Active Students",
      value: "N/A",
      icon: <Users size={24} className="text-assessify-primary" />,
    },
    {
      title: "Latest Course",
      value: courses.length > 0 ? "Available" : "None",
      icon: <CheckCircle size={24} className="text-assessify-primary" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};

export default CourseStats;
