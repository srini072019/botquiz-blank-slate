
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/course.types";

interface CourseCardContentProps {
  title: string;
  isPublished: boolean;
  updatedAt: Date;
  onClick: () => void;
}

const CourseCardContent = ({ title, isPublished, updatedAt, onClick }: CourseCardContentProps) => {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow duration-300 cursor-pointer" onClick={onClick}>
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div>
          {isPublished ? (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Published
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              Draft
            </span>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Last updated: {updatedAt.toLocaleDateString()}
      </p>
      <div className="mt-4">
        <Button variant="outline" size="sm">
          View Course
        </Button>
      </div>
    </Card>
  );
};

export default CourseCardContent;
