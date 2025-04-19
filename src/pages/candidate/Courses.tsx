
import { useState } from "react";
import CandidateLayout from "@/layouts/CandidateLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseCard from "@/components/course/CourseCard";
import { useCourses } from "@/hooks/useCourses";
import { useEnrollment } from "@/hooks/useEnrollment";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CandidateCourses = () => {
  const { authState } = useAuth();
  const candidateId = authState.user?.id || "candidate-1"; // Will use actual user ID in production
  
  const { courses } = useCourses();
  const { enrolledCourseIds, enrollInCourse, isLoading } = useEnrollment(candidateId);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter published courses only for candidates
  const publishedCourses = courses.filter(course => course.isPublished);
  
  // Compute enrolled courses
  const enrolledCourses = publishedCourses.filter(course => 
    enrolledCourseIds.includes(course.id)
  );

  // Available courses (not enrolled)
  const availableCourses = publishedCourses.filter(course => 
    !enrolledCourseIds.includes(course.id)
  );

  // Filter courses based on search term
  const filteredEnrolledCourses = enrolledCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAvailableCourses = availableCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <CandidateLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-gray-600 mt-2">Discover and enroll in courses</p>
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

        <Tabs defaultValue="enrolled">
          <TabsList>
            <TabsTrigger value="enrolled">My Courses ({enrolledCourses.length})</TabsTrigger>
            <TabsTrigger value="available">Available Courses ({availableCourses.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enrolled" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrolledCourses.length > 0 ? (
                filteredEnrolledCourses.map(course => (
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
                    <p className="text-gray-500">No enrolled courses match your search</p>
                  ) : (
                    <p className="text-gray-500">You haven't enrolled in any courses yet</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="available" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvailableCourses.length > 0 ? (
                filteredAvailableCourses.map(course => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    actionButton={
                      <Button 
                        size="sm" 
                        onClick={() => enrollInCourse(course.id)} 
                        disabled={isLoading}
                      >
                        Enroll Now
                      </Button>
                    }
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  {searchTerm ? (
                    <p className="text-gray-500">No available courses match your search</p>
                  ) : (
                    <p className="text-gray-500">No more courses are available for enrollment</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CandidateLayout>
  );
};

export default CandidateCourses;
