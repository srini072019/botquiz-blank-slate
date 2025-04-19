
import { Card } from "@/components/ui/card";
import { BookOpen, CalendarCheck, CheckCircle } from "lucide-react";

const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 bg-assessify-accent rounded-full">
            <BookOpen className="h-6 w-6 text-assessify-primary" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Enrolled Courses</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
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
            <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
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
            <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardMetrics;
