
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/course.types";
import { CalendarIcon, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  actionButton?: React.ReactNode;
}

const CourseCard = ({ course, actionButton }: CourseCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 relative">
        {course.imageUrl ? (
          <img 
            src={course.imageUrl} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-assessify-accent">
            <span className="text-xl font-bold text-assessify-primary">
              {course.title.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        
        {!course.isPublished && (
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            Draft
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {course.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
          <div className="flex items-center">
            <CalendarIcon size={14} className="mr-1" />
            <span>{formatDate(course.createdAt)}</span>
          </div>
          
          {course.enrollmentCount !== undefined && (
            <div className="flex items-center">
              <Users size={14} className="mr-1" />
              <span>{course.enrollmentCount} students</span>
            </div>
          )}
        </div>
        
        {actionButton}
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
