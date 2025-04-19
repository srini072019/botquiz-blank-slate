
import { Course } from "./course.types";

export interface Subject {
  id: string;
  title: string;
  description: string;
  courseId: string;
  course?: Course;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectFormData {
  title: string;
  description: string;
  courseId: string;
  order?: number;
}
