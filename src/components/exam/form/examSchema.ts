
import { z } from "zod";
import { ExamStatus } from "@/types/exam.types";

export const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  courseId: z.string().min(1, "Course is required"),
  timeLimit: z.coerce.number().min(5, "Time limit must be at least 5 minutes"),
  passingScore: z.coerce.number().min(1, "Passing score is required").max(100, "Passing score cannot exceed 100%"),
  shuffleQuestions: z.boolean(),
  useQuestionPool: z.boolean().default(false),
  status: z.nativeEnum(ExamStatus),
  questions: z.array(z.string()),
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
}).refine((data) => {
  const startDateTime = new Date(
    `${data.startDate.toISOString().split('T')[0]}T${data.startTime}`
  );
  const endDateTime = new Date(
    `${data.endDate.toISOString().split('T')[0]}T${data.endTime}`
  );
  return endDateTime > startDateTime;
}, {
  message: "End date/time must be after start date/time",
  path: ["endTime"],
});
