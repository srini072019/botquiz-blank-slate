
import { useState, useEffect } from "react";
import CandidateLayout from "@/layouts/CandidateLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseCard from "@/components/course/CourseCard";
import { useEnrollment } from "@/hooks/useEnrollment";
import { Course } from "@/types/course.types";
import { Search, Loader2 } from "lucide-react";

const CandidateCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { getEnrolledCourses } = useEnrollment();

  useEffect(() => {
    const fetchCourses = async () => {
      const courses = await getEnrolledCourses();
      setEnrolledCourses(courses);
      setIsLoading(false);
    };

    fetchCourses();
  }, []);

  // Filter courses based on search term
  const filteredCourses = enrolledCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <CandidateLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Your Courses</h1>
          <p className="text-gray-600 mt-2">Access your enrolled courses</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search courses..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                actionButton={
                  <Button variant="outline" size="sm">
                    View Course
                  </Button>
                }
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              {searchTerm ? (
                <p className="text-gray-500">No courses match your search</p>
              ) : (
                <p className="text-gray-500">You are not enrolled in any courses yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </CandidateLayout>
  );
};

export default CandidateCourses;
