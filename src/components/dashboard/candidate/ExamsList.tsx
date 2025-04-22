
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import UpcomingExam from "./UpcomingExam";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { examCandidateAssignmentColumns } from "@/types/exam-candidate.types";

interface Exam {
  id: string;
  title: string;
  course: {
    title: string;
  };
  time_limit: number;
  end_date: string;
  status: 'scheduled' | 'available' | 'completed';
}

const ExamsList = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchExams = async () => {
      if (!authState.user?.id) return;

      try {
        setLoading(true);
        console.log("Fetching exams for candidate ID:", authState.user.id);

        // Fetch assignments for this candidate
        const { data: assignments, error: assignmentsError } = await supabase
          .from('exam_candidate_assignments')
          .select(`
            id,
            status,
            ${examCandidateAssignmentColumns.examId}
          `)
          .eq(examCandidateAssignmentColumns.candidateId, authState.user.id);

        if (assignmentsError) {
          console.error('Error fetching exam assignments:', assignmentsError);
          throw assignmentsError;
        }

        console.log("Raw exam assignments:", assignments);
        
        if (!assignments || assignments.length === 0) {
          console.log("No exam assignments found for this candidate");
          setExams([]);
          setLoading(false);
          return;
        }

        // Extract exam IDs from assignments
        const examIds = assignments.map(assignment => assignment[examCandidateAssignmentColumns.examId]);
        
        // Fetch exam details for these IDs
        const { data: examData, error: examError } = await supabase
          .from('exams')
          .select(`
            id,
            title,
            time_limit,
            end_date,
            course:courses (
              title
            )
          `)
          .in('id', examIds);

        if (examError) {
          console.error('Error fetching exam details:', examError);
          throw examError;
        }

        console.log("Raw exam data:", examData);

        // Combine exam data with assignment status
        const formattedExams = examData
          .filter(exam => exam && exam.id)
          .map(exam => {
            // Find the matching assignment to get status
            const assignment = assignments.find(a => a[examCandidateAssignmentColumns.examId] === exam.id);
            
            return {
              id: exam.id,
              title: exam.title,
              course: {
                title: exam.course?.title || "Untitled Course"
              },
              time_limit: exam.time_limit,
              end_date: exam.end_date,
              status: assignment?.status as 'scheduled' | 'available' | 'completed'
            };
          });

        console.log("Formatted exams for candidate:", formattedExams);
        setExams(formattedExams);
      } catch (error) {
        console.error('Error fetching exams:', error);
        toast.error('Failed to load exams');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [authState.user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exams</h2>
        <Button variant="outline" asChild>
          <Link to="/candidate/exams">View All Exams</Link>
        </Button>
      </div>
      
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <UpcomingExam
              key={exam.id}
              title={exam.title}
              course={exam.course.title}
              date={exam.end_date ? new Date(exam.end_date).toLocaleDateString() : ""}
              duration={`${exam.time_limit} minutes`}
              status={exam.status}
              examId={exam.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Exams Available</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">You don't have any exams at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default ExamsList;
