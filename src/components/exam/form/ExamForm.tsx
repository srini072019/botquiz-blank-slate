
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Course } from "@/types/course.types";
import { Question } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import { QuestionPool } from "@/types/question-pool.types";
import { ExamFormData, ExamStatus } from "@/types/exam.types";
import ExamHeaderFields from "./ExamHeaderFields";
import ExamSettingsFields from "./ExamSettingsFields";
import ExamDateFields from "./ExamDateFields";
import ExamQuestionSelection from "./ExamQuestionSelection";
import { useQuestionSelection } from "@/hooks/useQuestionSelection";
import { examSchema } from "@/components/exam/form/examSchema";

interface ExamFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    courseId?: string;
    timeLimit?: number;
    passingScore?: number;
    shuffleQuestions?: boolean;
    useQuestionPool?: boolean;
    questionPool?: QuestionPool;
    status?: ExamStatus;
    questions?: string[];
    startDate?: Date;
    endDate?: Date;
    startTime?: string;
    endTime?: string;
  };
  courses: Course[];
  questions: Question[];
  subjects: Subject[];
  onSubmit: (data: ExamFormData) => void;
  isSubmitting: boolean;
  courseIdFixed?: boolean;
  isEdit?: boolean;
}

const ExamForm = ({
  initialData,
  courses,
  questions,
  subjects,
  onSubmit,
  isSubmitting,
  courseIdFixed = false,
  isEdit = false
}: ExamFormProps) => {
  const [useQuestionPool, setUseQuestionPool] = useState(initialData?.useQuestionPool || false);
  const [questionPool, setQuestionPool] = useState<QuestionPool | undefined>(
    initialData?.questionPool
  );

  const defaultStartDate = initialData?.startDate || new Date();
  const defaultEndDate = initialData?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const defaultStartTime = initialData?.startTime || "09:00";
  const defaultEndTime = initialData?.endTime || "17:00";

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      courseId: initialData?.courseId || "",
      timeLimit: initialData?.timeLimit || 30,
      passingScore: initialData?.passingScore || 70,
      shuffleQuestions: initialData?.shuffleQuestions || false,
      useQuestionPool: initialData?.useQuestionPool || false,
      status: initialData?.status || ExamStatus.DRAFT,
      questions: initialData?.questions || [],
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      startTime: initialData?.startTime || defaultStartTime,
      endTime: initialData?.endTime || defaultEndTime,
    },
  });

  const { 
    selectedCourseId, 
    filteredQuestions, 
    questionsBySubject 
  } = useQuestionSelection({
    form,
    questions,
    subjects
  });

  const handleSubmit = (data: ExamFormData) => {
    if (!useQuestionPool && data.questions.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    const startDateTime = new Date(
      `${data.startDate.toISOString().split('T')[0]}T${data.startTime}`
    );
    const endDateTime = new Date(
      `${data.endDate.toISOString().split('T')[0]}T${data.endTime}`
    );

    if (endDateTime <= startDateTime) {
      toast.error("End date/time must be after start date/time");
      return;
    }

    if (useQuestionPool) {
      if (!questionPool) {
        toast.error("Please configure the question pool");
        return;
      }

      const totalQuestionsFromSubjects = questionPool.subjects.reduce((sum, subject) => 
        sum + subject.count, 0);

      if (totalQuestionsFromSubjects <= 0) {
        toast.error("Question pool must include at least one question");
        return;
      }

      if (totalQuestionsFromSubjects > filteredQuestions.length) {
        toast.error(`Cannot select more questions than available (${filteredQuestions.length} available)`);
        return;
      }

      onSubmit({
        ...data,
        useQuestionPool: true,
        questionPool
      });
    } else {
      onSubmit({
        ...data,
        useQuestionPool: false
      });
    }
  };

  const watchQuestions = form.watch("questions");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <ExamHeaderFields 
              form={form} 
              courses={courses} 
              courseIdFixed={courseIdFixed} 
            />
          </div>

          <ExamDescriptionField form={form} />

          <ExamSettingsFields 
            form={form} 
            onUseQuestionPoolChange={setUseQuestionPool} 
          />

          <ExamDateFields form={form} />
        </div>

        <ExamQuestionSelection
          form={form}
          questionsBySubject={questionsBySubject}
          selectedCourseId={selectedCourseId}
          filteredQuestions={filteredQuestions}
          useQuestionPool={useQuestionPool}
          questionPool={questionPool}
          setQuestionPool={setQuestionPool}
          watchQuestions={watchQuestions}
          subjects={subjects}
          showPreview={isEdit}
        />

        <div className="flex justify-end sticky bottom-0 bg-white py-4 border-t mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Exam"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ExamForm;
