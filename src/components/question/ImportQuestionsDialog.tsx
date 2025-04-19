
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Check, Download, X } from "lucide-react";
import { Subject } from "@/types/subject.types";
import { QuestionFormData } from "@/types/question.types";
import { useImportQuestions } from "@/hooks/useImportQuestions";
import ImportQuestionsUpload from "./import/ImportQuestionsUpload";
import ImportQuestionsReview from "./import/ImportQuestionsReview";
import ImportTemplateInfo from "./import/ImportTemplateInfo";

export interface ImportQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  onImport: (questions: QuestionFormData[]) => Promise<void>;
  isLoading?: boolean;
}

const ImportQuestionsDialog = ({
  open,
  onOpenChange,
  subjects,
  onImport,
  isLoading: importLoading = false
}: ImportQuestionsDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const {
    isLoading: parsingLoading,
    error,
    progress,
    parsedQuestions,
    handleFileUpload: processFile,
    resetState,
    downloadTemplate
  } = useImportQuestions(subjects);
  
  // Use either the passed in loading state or the internal parsing loading state
  const isLoading = importLoading || parsingLoading;
  
  const onDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }
    onOpenChange(newOpen);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      processFile(file);
      setActiveTab("review");
    }
  };
  
  const handleImport = async () => {
    if (parsedQuestions.length > 0) {
      await onImport(parsedQuestions);
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate();
  };

  return (
    <Dialog open={open} onOpenChange={onDialogOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Questions</DialogTitle>
          <DialogDescription>
            Import questions from a spreadsheet file (Excel, CSV).
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleDownloadTemplate}
          >
            <Download size={16} />
            Download Template
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger 
              value="review" 
              disabled={parsedQuestions.length === 0}
            >
              Review ({parsedQuestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="py-4">
            <div className="space-y-6">
              <ImportQuestionsUpload 
                isLoading={isLoading}
                progress={progress}
                error={error}
                onFileChange={handleFileUpload}
              />
              
              <ImportTemplateInfo />
            </div>
          </TabsContent>

          <TabsContent value="review" className="py-4">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {parsedQuestions.length} Questions Ready to Import
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={isLoading || parsedQuestions.length === 0}
                  >
                    {isLoading ? (
                      "Importing..."
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Import Questions
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="whitespace-pre-wrap text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <ImportQuestionsReview 
                questions={parsedQuestions} 
                subjects={subjects} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImportQuestionsDialog;
