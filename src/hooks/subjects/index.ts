
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Course } from "@/types/course.types";
import { Subject } from "@/types/subject.types";
import { useSubjectsState } from "./useSubjectsState";
import { useSubjectOperations } from "./useSubjectOperations";

export const useSubjects = (courseId?: string) => {
  const {
    subjects,
    courseSubjects,
    isLoading,
    setLoading,
    setSubjects,
    setCourseSubjects
  } = useSubjectsState();

  const fetchSubjects = async () => {
    setLoading(true);
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
      
      // Now fetch all course_subjects relationships
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
      
      // Map the data
      const subjectCoursesMap: Record<string, Course[]> = {};
      courseSubjectsData?.forEach(cs => {
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
      
      // Map and set the state
      const mappedSubjects: Subject[] = (subjectsData || []).map(subject => ({
        id: subject.id,
        title: subject.title,
        description: subject.description || "",
        courses: subjectCoursesMap[subject.id] || [],
        order: 0,
        createdAt: new Date(subject.created_at),
        updatedAt: new Date(subject.updated_at),
      }));

      const mappedCourseSubjects = (courseSubjectsData || []).map(cs => ({
        id: cs.id,
        subjectId: cs.subject_id,
        courseId: cs.course_id,
        createdAt: new Date(cs.created_at)
      }));
      
      setSubjects(mappedSubjects);
      setCourseSubjects(mappedCourseSubjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const operations = useSubjectOperations(fetchSubjects);

  const getSubject = (id: string): Subject | undefined => {
    return subjects.find(subject => subject.id === id);
  };

  const getSubjectsByCourse = (courseId: string): Subject[] => {
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
    ...operations,
    getSubject,
    getSubjectsByCourse,
    fetchSubjects,
  };
};
