
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PoolHeaderProps {
  totalQuestions: number;
  availableQuestionCount: number;
  onTotalQuestionsChange: (value: string) => void;
}

const PoolHeader = ({
  totalQuestions,
  availableQuestionCount,
  onTotalQuestionsChange
}: PoolHeaderProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="totalQuestions">Total Questions</Label>
        <Input
          id="totalQuestions"
          type="number"
          min="1"
          value={totalQuestions}
          onChange={(e) => onTotalQuestionsChange(e.target.value)}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Number of questions to randomly select from the pool
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mt-6">
          Available questions in course: <span className="font-medium">{availableQuestionCount}</span>
        </p>
      </div>
    </div>
  );
};

export default PoolHeader;
