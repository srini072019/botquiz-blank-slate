
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Subject } from "@/types/subject.types";
import { SubjectPoolItem as SubjectPoolItemType } from "@/types/question-pool.types";
import SubjectPoolItem from "./SubjectPoolItem";

interface SubjectsListProps {
  subjects: Subject[];
  poolSubjects: SubjectPoolItemType[];
  onAddSubject: () => void;
  onUpdateSubject: (index: number, field: string, value: any) => void;
  onRemoveSubject: (index: number) => void;
}

const SubjectsList = ({
  subjects,
  poolSubjects,
  onAddSubject,
  onUpdateSubject,
  onRemoveSubject
}: SubjectsListProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Subject Distribution</h4>
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          onClick={onAddSubject}
          disabled={subjects.length === poolSubjects.length}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Subject
        </Button>
      </div>

      {poolSubjects.map((subjectItem, index) => (
        <SubjectPoolItem
          key={index}
          subjects={subjects}
          subjectItem={subjectItem}
          poolSubjects={poolSubjects}
          index={index}
          onUpdate={onUpdateSubject}
          onRemove={onRemoveSubject}
        />
      ))}
      
      {poolSubjects.length === 0 && (
        <div className="text-center p-4 border rounded-md text-muted-foreground">
          No subjects added to the pool yet. Click "Add Subject" to begin.
        </div>
      )}
    </div>
  );
};

export default SubjectsList;
