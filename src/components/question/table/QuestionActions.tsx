import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings2, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuestions } from "@/hooks/useQuestions";
import { toast } from "sonner"; // Replace useToast with sonner
import QuestionPreview from "../QuestionPreview";
import QuestionForm from "../QuestionForm";
import { Subject } from "@/types/subject.types";
import { Question } from "@/types/question.types";

interface QuestionActionsProps {
  question: Question;
  subjects: Subject[];
}

const QuestionActions = ({ question, subjects }: QuestionActionsProps) => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { updateQuestion, deleteQuestion, isLoading } = useQuestions();

  const handleView = () => {
    setIsViewDialogOpen(true);
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this question?")) {
      const success = await deleteQuestion(question.id);
      if (success) {
        toast.success("Question deleted", {
          description: "The question has been successfully deleted."
        });
      }
    }
  };

  const handleUpdate = async (data: any) => {
    const success = await updateQuestion(question.id, data);
    if (success) {
      setIsEditDialogOpen(false);
      toast.success("Question updated", {
        description: "The question has been successfully updated."
      });
    }
  };

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            View question
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit question
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete question
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Question Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>View Question</DialogTitle>
          </DialogHeader>
          <QuestionPreview question={question} />
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Make changes to this question.
            </DialogDescription>
          </DialogHeader>
          <QuestionForm 
            subjects={subjects}
            onSubmit={handleUpdate}
            isSubmitting={isLoading}
            initialData={{
              text: question.text,
              type: question.type,
              subjectId: question.subjectId,
              difficultyLevel: question.difficultyLevel,
              explanation: question.explanation,
              options: question.options,
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionActions;
