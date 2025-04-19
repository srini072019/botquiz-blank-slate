
// Base API URL - will be updated when integrating with Supabase
export const BASE_URL = '/api';

export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
  },
  
  // User endpoints
  USERS: {
    BASE: `${BASE_URL}/users`,
    PROFILE: `${BASE_URL}/users/profile`,
  },
  
  // Course endpoints
  COURSES: {
    BASE: `${BASE_URL}/courses`,
    ENROLL: (courseId: string) => `${BASE_URL}/courses/${courseId}/enroll`,
  },
  
  // Subject endpoints
  SUBJECTS: {
    BASE: `${BASE_URL}/subjects`,
  },
  
  // Question endpoints
  QUESTIONS: {
    BASE: `${BASE_URL}/questions`,
    BY_SUBJECT: (subjectId: string) => `${BASE_URL}/subjects/${subjectId}/questions`,
  },
  
  // Exam endpoints
  EXAMS: {
    BASE: `${BASE_URL}/exams`,
    BY_COURSE: (courseId: string) => `${BASE_URL}/courses/${courseId}/exams`,
    TAKE: (examId: string) => `${BASE_URL}/exams/${examId}/take`,
    SUBMIT: (examId: string) => `${BASE_URL}/exams/${examId}/submit`,
  },
  
  // Result endpoints
  RESULTS: {
    BASE: `${BASE_URL}/results`,
    BY_EXAM: (examId: string) => `${BASE_URL}/exams/${examId}/results`,
    BY_USER: (userId: string) => `${BASE_URL}/users/${userId}/results`,
  },
};
