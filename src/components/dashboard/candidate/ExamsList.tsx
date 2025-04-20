
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import UpcomingExam from "./UpcomingExam";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

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
        const { data, error } = await supabase
          .from('exam_candidate_assignments')
          .select(`
            exam:exams (
              id,
              title,
              time_limit,
              end_date,
              course:courses (
                title
              )
            ),
            status
          `)
          .eq('candidate_id', authState.user.id)
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;

        const formattedExams = data
          .filter(item => item.exam)
          .map(item => ({
            id: item.exam.id,
            title: item.exam.title,
            course: {
              title: item.exam.course.title
            },
            time_limit: item.exam.time_limit,
            end_date: item.exam.end_date,
            status: item.status as 'scheduled' | 'available' | 'completed'
          }));

        setExams(formattedExams);
      } catch (error) {
        console.error('Error fetching exams:', error);
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
              date={new Date(exam.end_date).toLocaleDateString()}
              duration={`${exam.time_limit} minutes`}
              status={exam.status}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">No Exams Available</h3>
          <p className="text-gray-600 mt-2">You don't have any exams at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default ExamsList;
