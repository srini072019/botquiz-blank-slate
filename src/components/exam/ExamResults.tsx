
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamResult } from "@/types/exam-session.types";
import { CircleCheck, CircleX } from "lucide-react";

interface ExamResultsProps {
  result: ExamResult;
}

const ExamResults = ({ result }: ExamResultsProps) => {
  const minutes = Math.floor(result.timeTaken / 60);
  const seconds = result.timeTaken % 60;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
          <CardDescription>
            Your exam has been submitted and graded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-center">
                {result.score.toFixed(1)}%
              </div>
              <div className="text-center text-muted-foreground">
                Your Score
              </div>
            </div>
            <div className="space-y-2">
              <div className={`text-3xl font-bold text-center ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                {result.passed ? 'PASSED' : 'FAILED'}
              </div>
              <div className="text-center text-muted-foreground">
                {result.passed 
                  ? 'Congratulations!' 
                  : `Required: ${result.totalQuestions * 0.7}%`}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Total Questions
              </div>
              <div>{result.totalQuestions}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Correct Answers
              </div>
              <div>{result.correctAnswers}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Incorrect Answers
              </div>
              <div>{result.totalQuestions - result.correctAnswers}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Time Taken
              </div>
              <div>{minutes}m {seconds}s</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question Summary</CardTitle>
          <CardDescription>
            Detailed breakdown of your answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.detailedResults.map((item, index) => (
              <div key={item.questionId} className="p-4 border rounded-md">
                <div className="flex items-start gap-2">
                  {item.correct ? (
                    <CircleCheck className="h-5 w-5 text-green-500 mt-1" />
                  ) : (
                    <CircleX className="h-5 w-5 text-red-500 mt-1" />
                  )}
                  <div>
                    <div className="font-medium">
                      Question {index + 1}
                    </div>
                    <div className="mt-1 text-sm">
                      {item.correct 
                        ? "You answered correctly" 
                        : "Your answer was incorrect"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamResults;
