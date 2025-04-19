
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ExamSession } from "@/types/exam-session.types";
import { Question, QuestionType } from "@/types/question.types";
import { ArrowLeft, ArrowRight, Clock, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExamTakingProps {
  examSession: ExamSession;
  questions: Question[];
  onSaveAnswer: (questionId: string, selectedOptions: string[]) => Promise<boolean>;
  onNavigate: (newIndex: number) => Promise<boolean>;
  onSubmit: () => void;
}

const ExamTaking = ({
  examSession,
  questions,
  onSaveAnswer,
  onNavigate,
  onSubmit,
}: ExamTakingProps) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  
  const currentQuestion = questions[examSession.currentQuestionIndex];
  const progress = ((examSession.currentQuestionIndex + 1) / questions.length) * 100;
  
  // Load the saved answer for the current question
  useEffect(() => {
    if (currentQuestion) {
      const savedAnswer = examSession.answers.find(
        (a) => a.questionId === currentQuestion.id
      );
      setSelectedOptions(savedAnswer?.selectedOptions || []);
    }
  }, [examSession.currentQuestionIndex, examSession.answers, currentQuestion]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const expiryTime = new Date(examSession.expiresAt);
      
      if (now >= expiryTime) {
        clearInterval(timer);
        toast.error("Time's up! Your exam is being submitted.");
        onSubmit();
        return;
      }
      
      const timeRemaining = formatDistanceToNow(expiryTime, { addSuffix: false });
      setTimeLeft(timeRemaining);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [examSession.expiresAt, onSubmit]);

  const handleOptionChange = async (optionId: string) => {
    let newSelectedOptions: string[] = [];
    
    if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE || 
        currentQuestion.type === QuestionType.TRUE_FALSE) {
      // Single selection
      newSelectedOptions = [optionId];
    } else {
      // Multiple selection
      if (selectedOptions.includes(optionId)) {
        newSelectedOptions = selectedOptions.filter((id) => id !== optionId);
      } else {
        newSelectedOptions = [...selectedOptions, optionId];
      }
    }
    
    setSelectedOptions(newSelectedOptions);
    await onSaveAnswer(currentQuestion.id, newSelectedOptions);
  };

  const handleNavigation = async (direction: "prev" | "next") => {
    const newIndex =
      direction === "next"
        ? examSession.currentQuestionIndex + 1
        : examSession.currentQuestionIndex - 1;
        
    if (newIndex >= 0 && newIndex < questions.length) {
      await onNavigate(newIndex);
    }
  };

  const handleSubmit = () => {
    setIsSubmitDialogOpen(true);
  };

  const confirmSubmit = () => {
    onSubmit();
    setIsSubmitDialogOpen(false);
  };

  if (!currentQuestion) {
    return <div>Question not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Clock className="mr-2" />
          <span>Time remaining: {timeLeft}</span>
        </div>
        <div>
          Question {examSession.currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      <Progress value={progress} className="mb-6" />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
          <CardDescription>
            {currentQuestion.type === QuestionType.MULTIPLE_ANSWER
              ? "Select all that apply"
              : "Select one answer"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.options.map((option) => (
            <div key={option.id} className="flex items-start space-x-2">
              <Checkbox
                checked={selectedOptions.includes(option.id)}
                onCheckedChange={() => handleOptionChange(option.id)}
                id={option.id}
              />
              <label
                htmlFor={option.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {option.text}
              </label>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => handleNavigation("prev")}
            disabled={examSession.currentQuestionIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>

          <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="mx-2"
                disabled={examSession.answers.length === 0}
              >
                <Flag className="mr-2 h-4 w-4" /> Submit Exam
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have answered {examSession.answers.length} out of {questions.length} questions.
                  Once submitted, you won't be able to make changes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmSubmit}>
                  Submit Exam
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {examSession.currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={() => handleNavigation("next")}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="default" onClick={handleSubmit}>
              Review & Submit
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExamTaking;
