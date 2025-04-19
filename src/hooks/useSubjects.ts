
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Subject, SubjectFormData } from "@/types/subject.types";
import { supabase } from "@/integrations/supabase/client";

export const useSubjects = (courseId?: string) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubjectsWithQuestions = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('subjects')
        .select(`
          *,
          courses!subjects_course_id_fkey(*),
          questions!inner(*)
        `)
        .order('created_at', { ascending: false });
      
      if (courseId) {
        query = query.eq('course_id', courseId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Only include subjects that have questions
      const subjectsWithQuestions = data
        .filter(subject => subject.questions.length > 0)
        .map(subject => ({
          id: subject.id,
          title: subject.title,
          description: subject.description || "",
          courseId: subject.course_id,
          course: subject.courses ? {
            id: subject.courses.id,
            title: subject.courses.title,
            description: subject.courses.description || "",
            imageUrl: subject.courses.image_url || "",
            instructorId: subject.courses.instructor_id,
            isPublished: subject.courses.is_published,
            createdAt: new Date(subject.courses.created_at),
            updatedAt: new Date(subject.courses.updated_at)
          } : undefined,
          order: 0,
          createdAt: new Date(subject.created_at),
          updatedAt: new Date(subject.updated_at),
        }));
      
      setSubjects(subjectsWithQuestions);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
    } finally {
      setIsLoading(false);
    }
  };

  const createSubject = async (data: SubjectFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('subjects')
        .insert({
          title: data.title,
          description: data.description,
          course_id: data.courseId,
        });

      if (error) throw error;

      await fetchSubjectsWithQuestions();
      toast.success("Subject created successfully");
      return true;
    } catch (error) {
      console.error("Error creating subject:", error);
      toast.error("Failed to create subject");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubject = async (id: string, data: SubjectFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('subjects')
        .update({
          title: data.title,
          description: data.description,
          course_id: data.courseId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchSubjectsWithQuestions();
      toast.success("Subject updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating subject:", error);
      toast.error("Failed to update subject");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubject = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSubjectsWithQuestions();
      toast.success("Subject deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getSubject = (id: string): Subject | undefined => {
    return subjects.find(subject => subject.id === id);
  };

  const getSubjectsByCourse = (courseId: string): Subject[] => {
    return subjects
      .filter(subject => subject.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  };

  useEffect(() => {
    fetchSubjectsWithQuestions();
  }, [courseId]);

  return {
    subjects,
    isLoading,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubject,
    getSubjectsByCourse,
    fetchSubjects: fetchSubjectsWithQuestions,
  };
};
