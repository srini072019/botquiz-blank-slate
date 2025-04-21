
// Split out presentational subcomponents
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
  status: 'available' | 'scheduled' | 'completed';
}

const Exams = () => {
  const { authState } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "available" | "past">("available");

  const now = new Date();

  useEffect(() => {
    const fetchExams = async () => {
      if (!authState.user?.id) return;

      try {
        setLoading(true);
        console.log("Fetching exams for candidate ID:", authState.user.id);
        const { data, error } = await supabase
          .from('exam_candidate_assignments')
          .select(`
            status,
            exam:exams (
              id,
              title,
              description,
              time_limit,
              start_date,
              end_date,
              exam_questions(count)
            )
          `)
          .eq('candidate_id', authState.user.id);

        if (error) {
          console.error("Error fetching exams:", error);
          toast.error("Failed to load exams");
          throw error;
        }

        console.log("Raw exam data:", data);

        // Process the data
        const processedExams = data
          .filter(item => item.exam) // Filter out null exams
          .map(item => ({
            id: item.exam.id,
            title: item.exam.title,
            description: item.exam.description || "",
            time_limit: item.exam.time_limit,
            questions_count: item.exam.exam_questions?.length || 0,
            start_date: item.exam.start_date,
            end_date: item.exam.end_date,
            status: item.status as 'available' | 'scheduled' | 'completed'
          }));

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
        return isStarted && isNotEnded && exam.status === 'available';
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
