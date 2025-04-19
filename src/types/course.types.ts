
import { User } from "./auth.types";

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  instructorId: string;
  instructor?: User;
  createdAt: Date;
  updatedAt: Date;
  enrollmentCount?: number;
  isPublished: boolean;
}

export interface CourseFormData {
  title: string;
  description: string;
  imageUrl?: string;
  isPublished: boolean;
}
