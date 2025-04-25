
import { Exam, ExamStatus } from "@/types/exam.types";
import { ExamData } from "../types/exam.types";

export const transformExamData = (examData: ExamData): Exam => ({
  id: examData.id,
  title: examData.title,
  description: examData.description || "",
  courseId: examData.course_id,
  instructorId: examData.instructor_id,
  timeLimit: examData.time_limit,
  passingScore: examData.passing_score,
  shuffleQuestions: examData.shuffle_questions,
  status: examData.status as ExamStatus,
  questions: [],
  createdAt: new Date(examData.created_at),
  updatedAt: new Date(examData.updated_at),
  startDate: examData.start_date ? new Date(examData.start_date) : undefined,
  endDate: examData.end_date ? new Date(examData.end_date) : undefined,
  useQuestionPool: examData.use_question_pool ?? false,
  questionPool: examData.question_pool ? JSON.parse(String(examData.question_pool)) : undefined,
});
