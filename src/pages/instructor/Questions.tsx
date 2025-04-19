
import { useState, useEffect } from "react";
import { Plus, Upload } from "lucide-react";
import InstructorLayout from "@/layouts/InstructorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubjects } from "@/hooks/useSubjects";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionForm from "@/components/question/QuestionForm";
import QuestionTable from "@/components/question/QuestionTable";
import ImportQuestionsDialog from "@/components/question/ImportQuestionsDialog";
import { Badge } from "@/components/ui/badge";
import { useQuestions } from "@/hooks/useQuestions";
import { useExams } from "@/hooks/useExams";
import { toast } from "sonner";
import { QuestionFormData } from "@/types/question.types";

const QuestionsPage = () => {
  const { subjects, fetchSubjects } = useSubjects();
  const { questions, createQuestion, isLoading, fetchQuestions } = useQuestions();
  const { exams } = useExams();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [importLoading, setImportLoading] = useState(false);
  const [examStats, setExamStats] = useState({ total: 0, active: 0 });

  useEffect(() => {
    fetchSubjects();
    fetchQuestions();
  }, []);

  // Calculate exam statistics
  useEffect(() => {
    if (exams.length > 0) {
      const active = exams.filter(exam => exam.status === 'published').length;
      setExamStats({
        total: exams.length,
        active
      });
    }
  }, [exams]);

  const handleCreateQuestion = async (data: any) => {
    const success = await createQuestion(data);
    if (success) {
      setIsCreateDialogOpen(false);
      // Questions list is refreshed in the hook
    }
  };

  const handleImportQuestions = async (questionsData: QuestionFormData[]) => {
    setImportLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      // Process questions one by one
      for (const questionData of questionsData) {
        try {
          const success = await createQuestion(questionData);
          if (success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          console.error("Error creating question:", err);
          errorCount++;
        }
      }

      if (errorCount > 0) {
        toast.warning(`Imported ${successCount} questions with ${errorCount} errors`);
      } else {
        toast.success(`Successfully imported ${successCount} questions`);
      }
      
      setIsImportDialogOpen(false);
      return Promise.resolve();
    } catch (error) {
      console.error("Error in batch import:", error);
      toast.error("Failed to import questions");
      return Promise.reject(error);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Question Bank</h1>
            <p className="text-gray-500 mt-1">Manage all your questions across subjects</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload size={18} />
              <span>Import</span>
            </Button>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={18} />
                  <span>Create Question</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Question</DialogTitle>
                  <DialogDescription>
                    Create a new question for your question bank.
                  </DialogDescription>
                </DialogHeader>
                <QuestionForm 
                  subjects={subjects}
                  onSubmit={handleCreateQuestion}
                  isSubmitting={isLoading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{questions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{examStats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{examStats.active}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="bg-gray-50 dark:bg-gray-800">
            <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">
                    All Questions <Badge variant="outline" className="ml-2">{questions.length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </CardHeader>
          <CardContent className="p-6">
            <QuestionTable questions={questions} subjects={subjects} />
          </CardContent>
        </Card>
      </div>
      
      <ImportQuestionsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        subjects={subjects}
        onImport={handleImportQuestions}
        isLoading={importLoading}
      />
    </InstructorLayout>
  );
};

export default QuestionsPage;
