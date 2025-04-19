
import { UseFormReturn } from "react-hook-form";
import { Subject } from "@/types/subject.types";
import { Question } from "@/types/question.types";
import { QuestionPool } from "@/types/question-pool.types";
import { ExamFormData } from "@/types/exam.types";
import QuestionPoolConfig from "../QuestionPoolConfig";
import QuestionSelectionSection from "../QuestionSelectionSection";
import ExamPreview from "../ExamPreview";

interface ExamQuestionSelectionProps {
  form: UseFormReturn<ExamFormData>;
  questionsBySubject: Record<string, { subject: Subject; questions: Question[] }>;
  selectedCourseId: string;
  filteredQuestions: Question[];
  useQuestionPool: boolean;
  questionPool: QuestionPool | undefined;
  setQuestionPool: (pool: QuestionPool) => void;
  watchQuestions: string[];
  subjects: Subject[];
  showPreview?: boolean;
}

const ExamQuestionSelection = ({
  form,
  questionsBySubject,
  selectedCourseId,
  filteredQuestions,
  useQuestionPool,
  questionPool,
  setQuestionPool,
  watchQuestions,
  subjects,
  showPreview = false
}: ExamQuestionSelectionProps) => {
  if (!useQuestionPool) {
    return (
      <>
        <QuestionSelectionSection
          form={form}
          questionsBySubject={questionsBySubject}
          selectedCourseId={selectedCourseId}
        />
        {showPreview && watchQuestions.length > 0 && (
          <ExamPreview 
            questions={filteredQuestions.filter(q => watchQuestions.includes(q.id))} 
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="border rounded-md p-4 space-y-4">
        <h3 className="text-lg font-medium">Question Pool Configuration</h3>
        <QuestionPoolConfig 
          subjects={subjects.filter(s => s.courseId === selectedCourseId)}
          initialPool={questionPool}
          onPoolChange={setQuestionPool}
          availableQuestionCount={filteredQuestions.length}
        />
      </div>
      {showPreview && questionPool && questionPool.subjects.length > 0 && (
        <ExamPreview 
          questions={filteredQuestions.slice(0, questionPool.subjects.reduce((sum, s) => sum + s.count, 0))} 
        />
      )}
    </>
  );
};

export default ExamQuestionSelection;
