
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CandidateLayout from "@/layouts/CandidateLayout";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Exam {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  questions_count: number;
  start_date?: string;
  end_date?: string;
  status: 'available' | 'scheduled' | 'completed';
}

const Exams = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "available" | "past">("available");
  
  // Get current date
  const now = new Date();
  
  useEffect(() => {
    const fetchExams = async () => {
      if (!authState.user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('exam_candidate_assignments')
          .select(`
            exam:exams (
              id,
              title,
              description,
              time_limit,
              start_date,
              end_date,
              exam_questions(count)
            ),
            status
          `)
          .eq('candidate_id', authState.user.id);

        if (error) throw error;

        // Process the data
        const processedExams = data
          .filter(item => item.exam) // Filter out null exams
          .map(item => ({
            id: item.exam.id,
            title: item.exam.title,
            description: item.exam.description || "",
            time_limit: item.exam.time_limit,
            questions_count: item.exam.exam_questions.length,
            start_date: item.exam.start_date,
            end_date: item.exam.end_date,
            status: item.status as 'available' | 'scheduled' | 'completed'
          }));

        setExams(processedExams);
        console.log("Processed exams:", processedExams);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [authState.user?.id]);

  const filteredExams = exams
    .filter(exam => {
      if (filter === "all") return true;
      
      const startDate = exam.start_date ? new Date(exam.start_date) : null;
      const endDate = exam.end_date ? new Date(exam.end_date) : null;
      
      if (filter === "upcoming") {
        return startDate && startDate > now;
      }
      
      if (filter === "available") {
        const isStarted = !startDate || startDate <= now;
        const isNotEnded = !endDate || endDate >= now;
        return isStarted && isNotEnded && exam.status === 'available';
      }
      
      if (filter === "past") {
        return (endDate && endDate < now) || exam.status === 'completed';
      }
      
      return true;
    });

  const getExamStatusBadge = (exam: Exam) => {
    if (exam.status === 'completed') {
      return <Badge className="bg-gray-500">Completed</Badge>;
    }
    
    const startDate = exam.start_date ? new Date(exam.start_date) : null;
    const endDate = exam.end_date ? new Date(exam.end_date) : null;
    
    if (startDate && startDate > now) {
      return <Badge className="bg-yellow-500">Upcoming</Badge>;
    }
    
    if (endDate && endDate < now) {
      return <Badge className="bg-gray-500">Expired</Badge>;
    }
    
    return <Badge className="bg-green-500">Available</Badge>;
  };

  if (loading) {
    return (
      <CandidateLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </CandidateLayout>
    );
  }

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
                      <span>Time Limit: {exam.time_limit} minutes</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Questions: {exam.questions_count}</span>
                    </div>
                    {exam.start_date && (
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>
                          {format(new Date(exam.start_date), "MMM dd, yyyy")}
                          {exam.end_date && ` - ${format(new Date(exam.end_date), "MMM dd, yyyy")}`}
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
                      exam.status === 'completed' ||
                      (exam.start_date && new Date(exam.start_date) > now) || 
                      (exam.end_date && new Date(exam.end_date) < now)
                    }
                  >
                    {exam.status === 'completed'
                      ? "View Results"
                      : (exam.start_date && new Date(exam.start_date) > now) 
                        ? "Not Available Yet"
                        : (exam.end_date && new Date(exam.end_date) < now)
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
