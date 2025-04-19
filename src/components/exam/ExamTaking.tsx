import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  isPreview?: boolean;
}

const ExamTaking = ({
  examSession,
  questions,
  onSaveAnswer,
  onNavigate,
  onSubmit,
  isPreview = false,
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

  const handleNavigateToQuestion = async (index: number) => {
    if (index >= 0 && index < questions.length) {
      await onNavigate(index);
    }
  };

  const handleSubmit = () => {
    setIsSubmitDialogOpen(true);
  };

  const confirmSubmit = () => {
    onSubmit();
    setIsSubmitDialogOpen(false);
  };

  const renderPagination = () => {
    // For fewer questions, show all page links
    if (questions.length <= 10) {
      return (
        <PaginationContent>
          {questions.map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink 
                isActive={index === examSession.currentQuestionIndex}
                onClick={() => handleNavigateToQuestion(index)}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
      );
    }
    
    // For more questions, show a subset with ellipsis
    const currentIndex = examSession.currentQuestionIndex;
    const lastIndex = questions.length - 1;
    
    return (
      <PaginationContent>
        <PaginationItem>
          <PaginationLink 
            isActive={currentIndex === 0}
            onClick={() => handleNavigateToQuestion(0)}
          >
            1
          </PaginationLink>
        </PaginationItem>
        
        {currentIndex > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        
        {Array.from({ length: 5 }, (_, i) => {
          const pageIndex = Math.max(1, Math.min(lastIndex - 1, currentIndex - 2 + i));
          // Skip first and last page as they're shown separately
          if (pageIndex === 0 || pageIndex === lastIndex) return null;
          
          return (
            <PaginationItem key={pageIndex}>
              <PaginationLink 
                isActive={pageIndex === currentIndex}
                onClick={() => handleNavigateToQuestion(pageIndex)}
              >
                {pageIndex + 1}
              </PaginationLink>
            </PaginationItem>
          );
        }).filter(Boolean)}
        
        {currentIndex < lastIndex - 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        
        {lastIndex > 0 && (
          <PaginationItem>
            <PaginationLink 
              isActive={currentIndex === lastIndex}
              onClick={() => handleNavigateToQuestion(lastIndex)}
            >
              {lastIndex + 1}
            </PaginationLink>
          </PaginationItem>
        )}
      </PaginationContent>
    );
  };

  if (!currentQuestion) {
    return <div>Question not found</div>;
  }

  // Fixed: Used conditional rendering for disabled pagination links instead of disabled prop
  const isPreviousDisabled = examSession.currentQuestionIndex === 0;
  const isNextDisabled = examSession.currentQuestionIndex === questions.length - 1;

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

      <Card className="mb-6">
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
                <Flag className="mr-2 h-4 w-4" /> {isPreview ? "End Preview" : "Submit Exam"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have answered {examSession.answers.length} out of {questions.length} questions.
                  {!isPreview && " Once submitted, you won't be able to make changes."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmSubmit}>
                  {isPreview ? "End Preview" : "Submit Exam"}
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
              {isPreview ? "End Preview" : "Review & Submit"}
            </Button>
          )}
        </CardFooter>
      </Card>

      <Pagination className="mb-6">
        <PaginationContent>
          <PaginationItem>
            {isPreviousDisabled ? (
              <span className="flex h-10 items-center justify-center gap-1 pl-2.5 pr-4 py-2 text-sm text-muted-foreground opacity-50">
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </span>
            ) : (
              <PaginationPrevious onClick={() => handleNavigation("prev")} />
            )}
          </PaginationItem>
          
          {renderPagination()}
          
          <PaginationItem>
            {isNextDisabled ? (
              <span className="flex h-10 items-center justify-center gap-1 pl-4 pr-2.5 py-2 text-sm text-muted-foreground opacity-50">
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            ) : (
              <PaginationNext onClick={() => handleNavigation("next")} />
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {questions.map((_, index) => (
          <Button
            key={index}
            variant={index === examSession.currentQuestionIndex ? "default" : 
              (examSession.answers.some(a => a.questionId === questions[index].id) ? "outline" : "ghost")}
            size="sm"
            className="w-10 h-10 p-0"
            onClick={() => handleNavigateToQuestion(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
};

// Add missing import for icons used in the conditional rendering
import { ChevronLeft, ChevronRight } from "lucide-react";

export default ExamTaking;
