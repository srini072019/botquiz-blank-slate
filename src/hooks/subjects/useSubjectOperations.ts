
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubjectFormData } from "@/types/subject.types";
import { SubjectOperations } from "./types";

export const useSubjectOperations = (fetchSubjects: () => Promise<void>): SubjectOperations => {
  const createSubject = async (data: SubjectFormData): Promise<boolean> => {
    try {
      // Create the subject
      const { data: newSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert({
          title: data.title,
          description: data.description,
          course_id: null
        })
        .select()
        .single();

      if (subjectError) throw subjectError;

      // Create course-subject relationships
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
    }
  };

  const updateSubject = async (id: string, data: SubjectFormData): Promise<boolean> => {
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

      // Update course relationships
      const { data: currentRelationships, error: fetchError } = await supabase
        .from('course_subjects')
        .select('course_id')
        .eq('subject_id', id);

      if (fetchError) throw fetchError;

      // Handle relationship changes
      const currentCourseIds = currentRelationships.map(r => r.course_id);
      const courseIdsToAdd = data.courseIds.filter(cid => !currentCourseIds.includes(cid));
      const courseIdsToRemove = currentCourseIds.filter(cid => !data.courseIds.includes(cid));

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
    }
  };

  const deleteSubject = async (id: string): Promise<boolean> => {
    try {
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
    }
  };

  return {
    createSubject,
    updateSubject,
    deleteSubject
  };
};
