
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Question, DifficultyLevel } from "@/types/question.types";

interface QuestionItemProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  getDifficultyColor: (level: DifficultyLevel) => string;
}

const QuestionItem = ({ question, onEdit, onDelete, getDifficultyColor }: QuestionItemProps) => {
  return (
    <Card key={question.id}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{question.text}</CardTitle>
            <Badge className={getDifficultyColor(question.difficultyLevel)}>
              {question.difficultyLevel}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(question)}>
              <Edit size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(question.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        <CardDescription className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center gap-2 p-2 border rounded">
                <div className={`w-4 h-4 rounded-full ${option.isCorrect ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <span>{option.text}</span>
              </div>
            ))}
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default QuestionItem;
