
import { useState, useEffect } from "react";
import CandidateLayout from "@/layouts/CandidateLayout";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ExamFilterControls from "./exams/ExamFilterControls";
import ExamGrid from "./exams/ExamGrid";

interface Exam {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  questions_count: number;
  start_date?: string;
  end_date?: string;
  status: 'available' | 'scheduled' | 'completed' | 'pending';
}

const Exams = () => {
  const { authState } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "available" | "past">("all");

  const now = new Date();

  useEffect(() => {
    const fetchExams = async () => {
      if (!authState.user?.id) return;

      try {
        setLoading(true);
        console.log("Fetching exams for candidate ID:", authState.user.id);
        
        // First get all assignments for this candidate
        const { data: assignments, error: assignmentsError } = await supabase
          .from('exam_candidate_assignments')
          .select(`
            id,
            status,
            exam_id
          `)
          .eq('candidate_id', authState.user.id);
          
        if (assignmentsError) {
          console.error('Error fetching exam assignments:', assignmentsError);
          throw assignmentsError;
        }
        
        console.log("Assignments found:", assignments);
        
        if (!assignments || assignments.length === 0) {
          console.log("No assignments found for this candidate");
          setExams([]);
          setLoading(false);
          return;
        }
        
        // Extract exam IDs
        const examIds = assignments.map(a => a.exam_id);
        console.log("Exam IDs to fetch:", examIds);
        
        // Fetch exam details with question counts
        const { data: examData, error: examError } = await supabase
          .from('exams')
          .select(`
            id,
            title,
            description,
            time_limit,
            start_date,
            end_date
          `)
          .in('id', examIds);
          
        if (examError) {
          console.error("Error fetching exams:", examError);
          toast.error("Failed to load exams");
          throw examError;
        }

        console.log("Raw exam data:", examData);
        
        // Get question counts for each exam
        const questionsPromises = examIds.map(async (examId) => {
          const { data: questionsData, error: questionsError } = await supabase
            .from('exam_questions')
            .select('question_id')
            .eq('exam_id', examId);
            
          if (questionsError) {
            console.error(`Error fetching questions for exam ${examId}:`, questionsError);
            return { examId, count: 0 };
          }
          
          return { examId, count: questionsData?.length || 0 };
        });
        
        const questionCounts = await Promise.all(questionsPromises);
        console.log("Question counts:", questionCounts);
        
        // Process the data
        const processedExams = examData
          .filter(item => item) // Filter out null exams
          .map(item => {
            // Find the corresponding assignment to get status
            const assignment = assignments.find(a => a.exam_id === item.id);
            const questionCount = questionCounts.find(q => q.examId === item.id)?.count || 0;
            
            return {
              id: item.id,
              title: item.title,
              description: item.description || "",
              time_limit: item.time_limit,
              questions_count: questionCount,
              start_date: item.start_date,
              end_date: item.end_date,
              status: assignment?.status as 'available' | 'scheduled' | 'completed' | 'pending'
            };
          });

        setExams(processedExams);
        console.log("Processed exams:", processedExams);
      } catch (error) {
        console.error("Error fetching exams:", error);
        toast.error("Failed to load exams");
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
        return (isStarted && isNotEnded && (exam.status === 'available' || exam.status === 'pending'));
      }

      if (filter === "past") {
        return (endDate && endDate < now) || exam.status === 'completed';
      }

      return true;
    });

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
          <h1 className="text-2xl font-bold">Your Exams</h1>
          <ExamFilterControls filter={filter} setFilter={setFilter} />
        </div>
        <ExamGrid exams={filteredExams} now={now} />
      </div>
    </CandidateLayout>
  );
};

export default Exams;
