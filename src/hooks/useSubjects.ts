
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Subject, SubjectFormData, CourseSubject } from "@/types/subject.types";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/course.types";

export const useSubjects = (courseId?: string) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courseSubjects, setCourseSubjects] = useState<CourseSubject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      // First fetch all subjects
      let subjectsQuery = supabase
        .from('subjects')
        .select(`
          id,
          title,
          description,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });
      
      const { data: subjectsData, error: subjectsError } = await subjectsQuery;
      
      if (subjectsError) throw subjectsError;
      
      // Now fetch all course_subjects relationships (or filter by courseId if provided)
      let courseSubjectsQuery = supabase
        .from('course_subjects')
        .select(`
          id,
          subject_id,
          course_id,
          created_at,
          courses:courses(*)
        `);
      
      if (courseId) {
        courseSubjectsQuery = courseSubjectsQuery.eq('course_id', courseId);
      }
      
      const { data: courseSubjectsData, error: courseSubjectsError } = await courseSubjectsQuery;
      
      if (courseSubjectsError) throw courseSubjectsError;
      
      // Map the course subjects data
      const mappedCourseSubjects: CourseSubject[] = (courseSubjectsData || []).map(cs => ({
        id: cs.id,
        subjectId: cs.subject_id,
        courseId: cs.course_id,
        createdAt: new Date(cs.created_at)
      }));
      
      // Create a map of subject IDs to courses for easy lookup
      const subjectCoursesMap: Record<string, Course[]> = {};
      
      courseSubjectsData.forEach(cs => {
        if (!cs.courses) return;
        
        if (!subjectCoursesMap[cs.subject_id]) {
          subjectCoursesMap[cs.subject_id] = [];
        }
        
        subjectCoursesMap[cs.subject_id].push({
          id: cs.courses.id,
          title: cs.courses.title,
          description: cs.courses.description || "",
          imageUrl: cs.courses.image_url || "",
          instructorId: cs.courses.instructor_id,
          isPublished: cs.courses.is_published,
          createdAt: new Date(cs.courses.created_at),
          updatedAt: new Date(cs.courses.updated_at)
        });
      });
      
      // Map the subjects data and include associated courses
      const mappedSubjects: Subject[] = (subjectsData || []).map(subject => ({
        id: subject.id,
        title: subject.title,
        description: subject.description || "",
        courses: subjectCoursesMap[subject.id] || [],
        order: 0, // Default order
        createdAt: new Date(subject.created_at),
        updatedAt: new Date(subject.updated_at),
      }));
      
      setSubjects(mappedSubjects);
      setCourseSubjects(mappedCourseSubjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjectsWithQuestions = async () => {
    await fetchSubjects();
  };

  const createSubject = async (data: SubjectFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Include an empty string for course_id to satisfy TypeScript
      // This is a workaround since the database now has course_id as nullable
      // but TypeScript still expects it
      const { data: newSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert({
          title: data.title,
          description: data.description,
          course_id: null  // Set to null since we're using the junction table
        })
        .select()
        .single();

      if (subjectError) throw subjectError;

      // Now insert the course-subject relationships
      if (data.courseIds.length > 0) {
        const courseSubjectsToInsert = data.courseIds.map(courseId => ({
          subject_id: newSubject.id,
          course_id: courseId,
        }));

        const { error: relationshipError } = await supabase
          .from('course_subjects')
          .insert(courseSubjectsToInsert);

        if (relationshipError) throw relationshipError;
      }

      await fetchSubjects();
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
      // Update the subject
      const { error: subjectError } = await supabase
        .from('subjects')
        .update({
          title: data.title,
          description: data.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (subjectError) throw subjectError;

      // Get current course-subject relationships
      const { data: currentRelationships, error: fetchError } = await supabase
        .from('course_subjects')
        .select('course_id')
        .eq('subject_id', id);

      if (fetchError) throw fetchError;

      // Determine which relationships to add and which to remove
      const currentCourseIds = currentRelationships.map(r => r.course_id);
      const courseIdsToAdd = data.courseIds.filter(cid => !currentCourseIds.includes(cid));
      const courseIdsToRemove = currentCourseIds.filter(cid => !data.courseIds.includes(cid));

      // Add new relationships
      if (courseIdsToAdd.length > 0) {
        const toInsert = courseIdsToAdd.map(courseId => ({
          subject_id: id,
          course_id: courseId,
        }));
        
        const { error: insertError } = await supabase
          .from('course_subjects')
          .insert(toInsert);
          
        if (insertError) throw insertError;
      }

      // Remove old relationships
      if (courseIdsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('course_subjects')
          .delete()
          .eq('subject_id', id)
          .in('course_id', courseIdsToRemove);
          
        if (deleteError) throw deleteError;
      }

      await fetchSubjects();
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
      // The course_subjects records will be deleted automatically due to CASCADE
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSubjects();
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
    // Find all subjects that have a relationship with this course
    const subjectIds = courseSubjects
      .filter(cs => cs.courseId === courseId)
      .map(cs => cs.subjectId);
    
    return subjects
      .filter(subject => subjectIds.includes(subject.id))
      .sort((a, b) => a.order - b.order);
  };

  useEffect(() => {
    fetchSubjects();
  }, [courseId]);

  return {
    subjects,
    courseSubjects,
    isLoading,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubject,
    getSubjectsByCourse,
    fetchSubjects,
    fetchSubjectsWithQuestions,
  };
};
