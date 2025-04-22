
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubjectFormData } from "@/types/subject.types";
import { Course } from "@/types/course.types";
import { Checkbox } from "@/components/ui/checkbox";

// Define form schema
const subjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  courseIds: z.array(z.string()).min(1, "Please select at least one course"),
  order: z.number().optional(),
});

interface SubjectFormProps {
  initialData?: Partial<SubjectFormData>;
  courses: Course[];
  onSubmit: (data: SubjectFormData) => Promise<void>;
  isSubmitting: boolean;
  courseIdFixed?: boolean;
}

const SubjectForm = ({ initialData, courses, onSubmit, isSubmitting, courseIdFixed = false }: SubjectFormProps) => {
  // Initialize form
  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      courseIds: initialData?.courseIds || (courseIdFixed && courses.length > 0 ? [courses[0].id] : []),
      order: initialData?.order,
    },
  });

  const watchCourseIds = form.watch("courseIds");

  const toggleCourse = (courseId: string, checked: boolean) => {
    const current = form.getValues("courseIds");
    
    if (checked && !current.includes(courseId)) {
      form.setValue("courseIds", [...current, courseId], { shouldValidate: true });
    } else if (!checked && current.includes(courseId)) {
      form.setValue(
        "courseIds",
        current.filter(id => id !== courseId),
        { shouldValidate: true }
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Title</FormLabel>
              <FormControl>
                <Input placeholder="Programming Fundamentals" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide a detailed description of this subject" 
                  rows={4}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="courseIds"
          render={() => (
            <FormItem>
              <FormLabel>Courses</FormLabel>
              <div className="space-y-2">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`course-${course.id}`}
                      checked={watchCourseIds.includes(course.id)}
                      onCheckedChange={(checked) => toggleCourse(course.id, !!checked)}
                      disabled={courseIdFixed && courses.length === 1}
                    />
                    <label 
                      htmlFor={`course-${course.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {course.title}
                    </label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : initialData?.title ? "Update Subject" : "Create Subject"}
        </Button>
      </form>
    </Form>
  );
};

export default SubjectForm;
