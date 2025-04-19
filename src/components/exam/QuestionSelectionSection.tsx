
import { UseFormReturn } from "react-hook-form";
import { Question } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ExamFormData } from "@/types/exam.types";

interface QuestionsBySubjectMap {
  [subjectId: string]: {
    subject: Subject;
    questions: Question[];
  };
}

interface QuestionSelectionSectionProps {
  form: UseFormReturn<ExamFormData>;
  questionsBySubject: QuestionsBySubjectMap;
  selectedCourseId: string;
}

const QuestionSelectionSection = ({
  form,
  questionsBySubject,
  selectedCourseId,
}: QuestionSelectionSectionProps) => {
  const selectedQuestions = form.watch("questions");

  const handleQuestionToggle = (questionId: string) => {
    const currentQuestions = form.getValues("questions");
    const updatedQuestions = currentQuestions.includes(questionId)
      ? currentQuestions.filter((id) => id !== questionId)
      : [...currentQuestions, questionId];
    
    form.setValue("questions", updatedQuestions, { shouldValidate: true });
  };

  const handleSelectAllInSubject = (subjectId: string, checked: boolean) => {
    const subjectQuestions = questionsBySubject[subjectId]?.questions || [];
    const questionIds = subjectQuestions.map((q) => q.id);
    let updatedQuestions = [...form.getValues("questions")];
    
    if (checked) {
      // Add all questions from this subject
      questionIds.forEach((id) => {
        if (!updatedQuestions.includes(id)) {
          updatedQuestions.push(id);
        }
      });
    } else {
      // Remove all questions from this subject
      updatedQuestions = updatedQuestions.filter(
        (id) => !questionIds.includes(id)
      );
    }
    
    form.setValue("questions", updatedQuestions, { shouldValidate: true });
  };

  const isAllSubjectQuestionsSelected = (subjectId: string) => {
    const subjectQuestions = questionsBySubject[subjectId]?.questions || [];
    return subjectQuestions.every((q) => selectedQuestions.includes(q.id));
  };

  return (
    <div className="border rounded-md p-4 space-y-4">
      <h3 className="text-lg font-medium">Select Questions</h3>
      
      {Object.keys(questionsBySubject).length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          {selectedCourseId
            ? "No questions available for this course. Add questions first."
            : "Select a course to view available questions."}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(questionsBySubject).map(({ subject, questions }) => (
            <div key={subject.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`select-all-${subject.id}`}
                  checked={isAllSubjectQuestionsSelected(subject.id)}
                  onCheckedChange={(checked) =>
                    handleSelectAllInSubject(subject.id, !!checked)
                  }
                />
                <Label htmlFor={`select-all-${subject.id}`} className="font-medium">
                  {subject.title} ({questions.length} questions)
                </Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                {questions.map((question) => (
                  <div key={question.id} className="flex items-start gap-2">
                    <Checkbox
                      id={`question-${question.id}`}
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={() => handleQuestionToggle(question.id)}
                    />
                    <Label
                      htmlFor={`question-${question.id}`}
                      className="leading-tight"
                    >
                      {question.text.length > 100
                        ? `${question.text.substring(0, 100)}...`
                        : question.text}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionSelectionSection;
