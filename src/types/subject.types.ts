
import { Course } from "./course.types";

export interface Subject {
  id: string;
  title: string;
  description: string;
  courses?: Course[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectFormData {
  title: string;
  description: string;
  courseIds: string[];
  order?: number;
}

export interface CourseSubject {
  id: string;
  subjectId: string;
  courseId: string;
  createdAt: Date;
}
