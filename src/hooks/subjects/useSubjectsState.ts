
import { useState } from "react";
import { SubjectsState } from "./types";
import { Subject, CourseSubject } from "@/types/subject.types";

export const useSubjectsState = () => {
  const [state, setState] = useState<SubjectsState>({
    subjects: [],
    courseSubjects: [],
    isLoading: false
  });

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setSubjects = (subjects: Subject[]) => {
    setState(prev => ({ ...prev, subjects }));
  };

  const setCourseSubjects = (courseSubjects: CourseSubject[]) => {
    setState(prev => ({ ...prev, courseSubjects }));
  };

  return {
    ...state,
    setLoading,
    setSubjects,
    setCourseSubjects
  };
};
