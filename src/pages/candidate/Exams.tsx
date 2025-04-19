
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useExams } from "@/hooks/useExams";
import CandidateLayout from "@/layouts/CandidateLayout";
import { format } from "date-fns";
import { Exam, ExamStatus } from "@/types/exam.types";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Calendar } from "lucide-react";

const Exams = () => {
  const navigate = useNavigate();
  const { exams } = useExams();
  const [filter, setFilter] = useState<"all" | "upcoming" | "available" | "past">("available");
  
  // Get current date
  const now = new Date();
  
  const filteredExams = exams
    .filter(exam => exam.status === ExamStatus.PUBLISHED)
    .filter(exam => {
      if (filter === "all") return true;
      
      const startDate = exam.startDate ? new Date(exam.startDate) : null;
      const endDate = exam.endDate ? new Date(exam.endDate) : null;
      
      if (filter === "upcoming") {
        return startDate && startDate > now;
      }
      
      if (filter === "available") {
        const isStarted = !startDate || startDate <= now;
        const isNotEnded = !endDate || endDate >= now;
        return isStarted && isNotEnded;
      }
      
      if (filter === "past") {
        return endDate && endDate < now;
      }
      
      return true;
    });

  const getExamStatusBadge = (exam: Exam) => {
    const startDate = exam.startDate ? new Date(exam.startDate) : null;
    const endDate = exam.endDate ? new Date(exam.endDate) : null;
    
    if (startDate && startDate > now) {
      return <Badge className="bg-yellow-500">Upcoming</Badge>;
    }
    
    if (endDate && endDate < now) {
      return <Badge className="bg-gray-500">Expired</Badge>;
    }
    
    return <Badge className="bg-green-500">Available</Badge>;
  };

  return (
    <CandidateLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Available Exams</h1>
          <div className="flex space-x-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={filter === "upcoming" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("upcoming")}
            >
              Upcoming
            </Button>
            <Button 
              variant={filter === "available" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("available")}
            >
              Available
            </Button>
            <Button 
              variant={filter === "past" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("past")}
            >
              Past
            </Button>
          </div>
        </div>
        
        {filteredExams.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">No exams found for the selected filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{exam.title}</CardTitle>
                    {getExamStatusBadge(exam)}
                  </div>
                  <CardDescription>{exam.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Time Limit: {exam.timeLimit} minutes</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Questions: {exam.questions.length}</span>
                    </div>
                    {exam.startDate && (
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>
                          {format(new Date(exam.startDate), "MMM dd, yyyy")}
                          {exam.endDate && ` - ${format(new Date(exam.endDate), "MMM dd, yyyy")}`}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/candidate/exams/${exam.id}`)}
                    disabled={
                      (exam.startDate && new Date(exam.startDate) > now) || 
                      (exam.endDate && new Date(exam.endDate) < now)
                    }
                  >
                    {(exam.startDate && new Date(exam.startDate) > now) 
                      ? "Not Available Yet"
                      : (exam.endDate && new Date(exam.endDate) < now)
                        ? "Exam Expired" 
                        : "Take Exam"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CandidateLayout>
  );
};

export default Exams;
