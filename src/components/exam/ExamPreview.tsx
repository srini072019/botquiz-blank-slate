
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/types/question.types";
import QuestionPreview from "@/components/question/QuestionPreview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";

interface ExamPreviewProps {
  questions: Question[];
  useQuestionPool?: boolean;
  totalPoolQuestions?: number;
}

const ExamPreview = ({ questions, useQuestionPool, totalPoolQuestions }: ExamPreviewProps) => {
  const questionCount = questions?.length || 0;
  const poolSize = totalPoolQuestions || questionCount;
  
  // For debugging purposes
  useEffect(() => {
    console.log("ExamPreview rendered with:", {
      questionCount,
      useQuestionPool,
      totalPoolQuestions: totalPoolQuestions || "not specified",
      questions: questions?.map(q => q.id) || []
    });
  }, [questions, useQuestionPool, totalPoolQuestions, questionCount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Exam Preview ({questionCount} Questions
          {useQuestionPool && poolSize ? ` from pool of ${poolSize}` : ""})
        </CardTitle>
        {useQuestionPool && (
          <Alert variant="default" className="mt-2 bg-blue-50">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              This exam uses a question pool. {poolSize || questionCount} questions will be 
              randomly selected from the pool when a candidate takes the exam.
              {questionCount === 0 && " Preview shows available questions from selected subjects."}
            </AlertDescription>
          </Alert>
        )}
        
        {questionCount === 0 && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No questions available for preview. 
              {useQuestionPool 
                ? " Please check that the selected subjects in the question pool contain questions."
                : " Please add questions to this exam."}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {questionCount > 0 ? (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id}>
                  <div className="font-medium mb-2">Question {index + 1}</div>
                  <QuestionPreview question={question} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {useQuestionPool ? 
                "No questions available in the selected subjects pool." :
                "No questions have been added to this exam yet."
              }
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ExamPreview;
