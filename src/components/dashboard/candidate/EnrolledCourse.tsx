import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface EnrolledCourseProps {
  title: string;
  instructor: string;
  progress: number;
  nextExam?: {
    title: string;
    date: string;
  };
}

const EnrolledCourse = ({ title, instructor, progress, nextExam }: EnrolledCourseProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Instructor: {instructor}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="#">View Course</Link>
        </Button>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="text-gray-700 dark:text-gray-300">Progress</span>
          <span className="font-medium text-assessify-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {nextExam && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
            <CalendarCheck size={16} className="mr-2 text-assessify-primary" />
            Next Exam: {nextExam.title}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 pl-6">
            {nextExam.date}
          </div>
        </div>
      )}
    </Card>
  );
};

export default EnrolledCourse;
