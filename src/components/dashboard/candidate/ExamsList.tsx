
import UpcomingExam from "./UpcomingExam";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ExamsListProps {
  exams: Array<{
    title: string;
    course: string;
    date: string;
    duration: string;
    status: 'scheduled' | 'available' | 'completed';
  }>;
}

const ExamsList = ({ exams }: ExamsListProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exams</h2>
        <Button variant="outline" asChild>
          <Link to="#">View All Exams</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam, index) => (
          <UpcomingExam
            key={index}
            title={exam.title}
            course={exam.course}
            date={exam.date}
            duration={exam.duration}
            status={exam.status}
          />
        ))}
      </div>
    </div>
  );
};

export default ExamsList;
