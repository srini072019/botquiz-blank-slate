
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ImportQuestionsUploadProps {
  isLoading: boolean;
  progress: number;
  error: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImportQuestionsUpload = ({ 
  isLoading, 
  progress, 
  error, 
  onFileChange 
}: ImportQuestionsUploadProps) => {
  return (
    <div className="grid gap-4">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-60 bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center space-y-2">
          <FileSpreadsheet className="h-10 w-10 text-gray-400" />
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">Upload Spreadsheet File</p>
            <p className="text-xs text-gray-500">
              Upload XLSX, XLS, or CSV file with your questions
            </p>
          </div>
          <Button variant="outline" className="mt-2" disabled={isLoading}>
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>
        </div>
        <label className="cursor-pointer absolute inset-0">
          <input 
            type="file" 
            className="hidden" 
            accept=".xlsx,.xls,.csv" 
            onChange={onFileChange}
            disabled={isLoading}
          />
        </label>
      </div>
      
      {isLoading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">Processing file...</p>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-wrap text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ImportQuestionsUpload;
