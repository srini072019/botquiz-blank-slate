
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Minus } from "lucide-react";
import { Subject } from "@/types/subject.types";
import { SubjectPoolItem as SubjectPoolItemType } from "@/types/question-pool.types";

interface SubjectPoolItemProps {
  subjects: Subject[];
  subjectItem: SubjectPoolItemType;
  poolSubjects: SubjectPoolItemType[];
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}

const SubjectPoolItem = ({
  subjects,
  subjectItem,
  poolSubjects,
  index,
  onUpdate,
  onRemove
}: SubjectPoolItemProps) => {
  return (
    <div className="flex items-end gap-2 p-3 border rounded-md">
      <div className="flex-1">
        <Label htmlFor={`subject-${index}`}>Subject</Label>
        <Select
          value={subjectItem.subjectId}
          onValueChange={(value) => onUpdate(index, 'subjectId', value)}
        >
          <SelectTrigger id={`subject-${index}`}>
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects
              .filter(subject => 
                subject.id === subjectItem.subjectId || 
                !poolSubjects.some(item => item.subjectId === subject.id)
              )
              .map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.title}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-24">
        <Label htmlFor={`count-${index}`}>Count</Label>
        <Input
          id={`count-${index}`}
          type="number"
          min="1"
          value={subjectItem.count}
          onChange={(e) => onUpdate(index, 'count', e.target.value)}
        />
      </div>
      
      <Button 
        type="button" 
        size="icon" 
        variant="ghost" 
        className="mb-[2px]"
        onClick={() => onRemove(index)}
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SubjectPoolItem;
