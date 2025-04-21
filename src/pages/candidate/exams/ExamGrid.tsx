
import ExamCard, { ExamCardProps } from "./ExamCard";
import { Card, CardContent } from "@/components/ui/card";

interface ExamGridProps {
  exams: ExamCardProps["exam"][];
  now: Date;
}

const ExamGrid = ({ exams, now }: ExamGridProps) => {
  if (exams.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">No exams found for the selected filter.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => (
        <ExamCard key={exam.id} exam={exam} now={now} />
      ))}
    </div>
  );
};

export default ExamGrid;
