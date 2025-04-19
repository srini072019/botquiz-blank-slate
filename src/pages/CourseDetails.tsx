
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  instructor_id: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

interface Subject {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
}

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        if (!courseId) return;
        
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
        
        if (courseError) throw courseError;
        setCourse(courseData);
        
        // Fetch subjects for this course
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('course_id', courseId);
        
        if (subjectsError) throw subjectsError;
        setSubjects(subjectsData || []);
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast.error("Error loading course", {
          description: "There was a problem loading the course details."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or was removed.</p>
          <Button asChild>
            <Link to="/">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!course.is_published) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Course not available</h2>
          <p className="text-muted-foreground mb-6">This course is currently not published.</p>
          <Button asChild>
            <Link to="/">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Link>
        </Button>

        <div className="mb-8">
          {course.image_url ? (
            <img 
              src={course.image_url} 
              alt={course.title} 
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          ) : (
            <div className="w-full h-64 bg-muted rounded-lg mb-6 flex items-center justify-center">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <Badge className="bg-green-100 text-green-800">Published</Badge>
          </div>
          <p className="text-muted-foreground mt-2">{course.description || 'No description available'}</p>
          <div className="text-sm text-gray-500 mt-2">
            Last updated: {formatDate(new Date(course.updated_at))}
          </div>
        </div>
        
        <Tabs defaultValue="subjects" className="mb-8">
          <TabsList>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subjects" className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Course Subjects</h2>
            <Separator className="mb-6" />
            
            {subjects.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No subjects available for this course yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map((subject) => (
                  <Card key={subject.id}>
                    <CardHeader>
                      <CardTitle>{subject.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {subject.description || 'No description available'}
                      </p>
                      <Button className="mt-4" variant="outline">
                        View Questions
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="overview" className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Course Overview</h2>
            <Separator className="mb-6" />
            <p>Created on: {new Date(course.created_at).toLocaleDateString()}</p>
            {/* Additional course information can be added here */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetails;
