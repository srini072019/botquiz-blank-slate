
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Filter } from "lucide-react";
import { Question, DifficultyLevel } from "@/types/question.types";
import QuestionForm from "./QuestionForm";
import { useQuestions } from "@/hooks/useQuestions";
import { Subject } from "@/types/subject.types";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import QuestionItem from "./QuestionItem";

interface QuestionListProps {
  subjectId: string;
  subjects: Subject[];
}

const QuestionList = ({ subjectId, subjects }: QuestionListProps) => {
  const { questions: allQuestions, createQuestion, updateQuestion, deleteQuestion, isLoading } = useQuestions();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter questions for this subject
  const questions = allQuestions
    .filter(question => question.subjectId === subjectId)
    .filter(question => filterDifficulty === "all" || question.difficultyLevel === filterDifficulty)
    .filter(question => 
      searchQuery === "" || 
      question.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCreateQuestion = async (data: any) => {
    await createQuestion({
      ...data,
      subjectId,
    });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateQuestion = async (data: any) => {
    if (selectedQuestion) {
      await updateQuestion(selectedQuestion.id, {
        ...data,
      });
      setIsEditDialogOpen(false);
      setSelectedQuestion(null);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await deleteQuestion(id);
    }
  };

  const handleEditClick = (question: Question) => {
    setSelectedQuestion(question);
    setIsEditDialogOpen(true);
  };

  const getDifficultyColor = (level: DifficultyLevel) => {
    switch (level) {
      case DifficultyLevel.EASY:
        return "bg-green-100 text-green-800";
      case DifficultyLevel.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case DifficultyLevel.HARD:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Questions</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <Plus size={16} />
              <span>Add Question</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
              <DialogDescription>
                Create a new question for this subject.
              </DialogDescription>
            </DialogHeader>
            <QuestionForm 
              subjects={subjects}
              onSubmit={handleCreateQuestion}
              isSubmitting={isLoading}
              initialData={{ subjectId }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-grow">
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <SelectValue placeholder="Filter by difficulty" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value={DifficultyLevel.EASY}>Easy</SelectItem>
              <SelectItem value={DifficultyLevel.MEDIUM}>Medium</SelectItem>
              <SelectItem value={DifficultyLevel.HARD}>Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {questions.length > 0 ? (
          questions.map((question) => (
            <QuestionItem 
              key={question.id}
              question={question}
              onEdit={handleEditClick}
              onDelete={handleDeleteQuestion}
              getDifficultyColor={getDifficultyColor}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-gray-500">
              No questions found. Create your first question.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the details of this question.
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <QuestionForm 
              initialData={{
                text: selectedQuestion.text,
                type: selectedQuestion.type,
                subjectId: selectedQuestion.subjectId,
                difficultyLevel: selectedQuestion.difficultyLevel,
                explanation: selectedQuestion.explanation,
                options: selectedQuestion.options,
              }}
              subjects={subjects}
              onSubmit={handleUpdateQuestion}
              isSubmitting={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionList;
