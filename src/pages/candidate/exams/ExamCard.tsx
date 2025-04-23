
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

export interface ExamCardProps {
  exam: {
    id: string;
    title: string;
    description: string;
    time_limit: number;
    questions_count: number;
    start_date?: string;
    end_date?: string;
    status: 'available' | 'scheduled' | 'completed' | 'pending';
  };
  now: Date;
}

const ExamCard = ({ exam, now }: ExamCardProps) => {
  const navigate = useNavigate();

  const getExamStatusBadge = () => {
    if (exam.status === 'completed') {
      return <Badge className="bg-gray-500">Completed</Badge>;
    }
    if (exam.status === 'pending') {
      return <Badge className="bg-yellow-500">Pending</Badge>;
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

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{exam.title}</CardTitle>
          {getExamStatusBadge()}
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
            exam.status === 'pending' ||
            (exam.start_date && new Date(exam.start_date) > now) ||
            (exam.end_date && new Date(exam.end_date) < now)
          }
        >
          {exam.status === 'completed'
            ? "View Results"
            : exam.status === 'pending'
              ? "Waiting for Instructor"
              : (exam.start_date && new Date(exam.start_date) > now)
                ? "Not Available Yet"
                : (exam.end_date && new Date(exam.end_date) < now)
                  ? "Exam Expired"
                  : "Take Exam"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExamCard;
