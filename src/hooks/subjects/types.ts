
import { Subject, SubjectFormData, CourseSubject } from "@/types/subject.types";

export interface SubjectsState {
  subjects: Subject[];
  courseSubjects: CourseSubject[];
  isLoading: boolean;
}

export interface SubjectOperations {
  createSubject: (data: SubjectFormData) => Promise<boolean>;
  updateSubject: (id: string, data: SubjectFormData) => Promise<boolean>;
  deleteSubject: (id: string) => Promise<boolean>;
}
