
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { ExamFormData } from "@/types/exam.types";
import { Question } from "@/types/question.types";
import { Subject } from "@/types/subject.types";

interface UseQuestionSelectionProps {
  form: UseFormReturn<ExamFormData>;
  questions: Question[];
  subjects: Subject[];
}

export const useQuestionSelection = ({ form, questions, subjects }: UseQuestionSelectionProps) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [questionsBySubject, setQuestionsBySubject] = useState<
    Record<string, { subject: Subject; questions: Question[] }>
  >({});

  const watchCourseId = form.watch("courseId");

  useEffect(() => {
    if (watchCourseId) {
      setSelectedCourseId(watchCourseId);
      
      const courseSubjects = subjects.filter(subject => subject.courseId === watchCourseId);
      
      const courseQuestions = questions.filter(question => 
        courseSubjects.some(subject => subject.id === question.subjectId)
      );
      
      setFilteredQuestions(courseQuestions);

      const questionsBySubjectMap = courseQuestions.reduce((acc, question) => {
        const subject = subjects.find(s => s.id === question.subjectId);
        if (subject) {
          if (!acc[subject.id]) {
            acc[subject.id] = {
              subject,
              questions: []
            };
          }
          acc[subject.id].questions.push(question);
        }
        return acc;
      }, {} as Record<string, { subject: Subject, questions: Question[] }>);

      setQuestionsBySubject(questionsBySubjectMap);
    }
  }, [watchCourseId, questions, subjects]);

  return {
    selectedCourseId,
    filteredQuestions,
    questionsBySubject
  };
};
