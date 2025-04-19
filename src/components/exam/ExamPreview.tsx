
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/types/question.types";
import QuestionPreview from "@/components/question/QuestionPreview";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExamPreviewProps {
  questions: Question[];
}

const ExamPreview = ({ questions }: ExamPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Preview ({questions.length} Questions)</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id}>
                <div className="font-medium mb-2">Question {index + 1}</div>
                <QuestionPreview question={question} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ExamPreview;
