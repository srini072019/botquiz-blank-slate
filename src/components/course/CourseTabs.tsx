
import { Course } from "@/types/course.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseTabContent from "@/components/course/CourseTabContent";

interface CourseTabsProps {
  courses: Course[];
  publishedCourses: Course[];
  draftCourses: Course[];
  onEditCourse: (courseId: string) => void;
}

const CourseTabs = ({
  courses,
  publishedCourses,
  draftCourses,
  onEditCourse
}: CourseTabsProps) => {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">All Courses ({courses.length})</TabsTrigger>
        <TabsTrigger value="published">Published ({publishedCourses.length})</TabsTrigger>
        <TabsTrigger value="drafts">Drafts ({draftCourses.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-6">
        <CourseTabContent
          courses={courses}
          onEditCourse={onEditCourse}
          emptyMessage="You haven't created any courses yet"
        />
      </TabsContent>
      
      <TabsContent value="published" className="mt-6">
        <CourseTabContent
          courses={publishedCourses}
          onEditCourse={onEditCourse}
          emptyMessage="No published courses yet"
        />
      </TabsContent>
      
      <TabsContent value="drafts" className="mt-6">
        <CourseTabContent
          courses={draftCourses}
          onEditCourse={onEditCourse}
          emptyMessage="No draft courses"
        />
      </TabsContent>
    </Tabs>
  );
};

export default CourseTabs;
