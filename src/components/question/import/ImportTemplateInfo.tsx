
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";

const ImportTemplateInfo = () => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Format Requirements</h4>
      <p className="text-sm text-gray-500">
        Your spreadsheet should have the following columns:
      </p>
      <div className="max-h-[300px] overflow-auto">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Column</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Required</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold">question</TableCell>
              <TableCell>The text of the question</TableCell>
              <TableCell>Yes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">type</TableCell>
              <TableCell>
                Question type: "multiple_choice", "true_false", or "multiple_answer"
              </TableCell>
              <TableCell>Yes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">subject</TableCell>
              <TableCell>The subject name (must match an existing subject)</TableCell>
              <TableCell>Yes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">difficulty</TableCell>
              <TableCell>Difficulty level: "easy", "medium", or "hard"</TableCell>
              <TableCell>No</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">options</TableCell>
              <TableCell>Answer options (separate by semicolon ";" or new lines)</TableCell>
              <TableCell>Yes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">correctAnswers</TableCell>
              <TableCell>Text that identifies correct options (separate multiple answers with ";")</TableCell>
              <TableCell>Yes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">explanation</TableCell>
              <TableCell>Explanation of the answer</TableCell>
              <TableCell>No</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-gray-500 mt-2">
        <p className="font-medium mb-1">Tips:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>For true/false questions, options should be "True" and "False"</li>
          <li>For multiple_answer questions, include multiple values in correctAnswers separated by semicolons</li>
          <li>Subject names must exactly match existing subjects in your course</li>
          <li>Click the "Download Template" button at the top to get a pre-filled example spreadsheet</li>
        </ul>
      </div>
    </div>
  );
};

export default ImportTemplateInfo;
