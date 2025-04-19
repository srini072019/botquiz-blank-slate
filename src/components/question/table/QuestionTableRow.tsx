
import React from "react";
import { Settings, Eye, Copy, Pencil, Trash2 } from "lucide-react";
import { Question } from "@/types/question.types";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuestionTableRowProps {
  question: Question;
  subjectTitle: string;
  sequenceNumber: number;
  onPreview: (question: Question) => void;
  onDuplicate: (question: Question) => void;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

const QuestionTableRow = ({
  question,
  subjectTitle,
  sequenceNumber,
  onPreview,
  onDuplicate,
  onEdit,
  onDelete,
}: QuestionTableRowProps) => {
  return (
    <TableRow>
      <TableCell>{sequenceNumber}</TableCell>
      <TableCell>{subjectTitle}</TableCell>
      <TableCell className="max-w-[500px] truncate">{question.text}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPreview(question)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(question)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(question)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(question.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default QuestionTableRow;
