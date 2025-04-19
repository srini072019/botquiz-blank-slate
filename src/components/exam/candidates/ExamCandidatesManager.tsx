
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExamCandidates } from '@/hooks/useExamCandidates';
import { toast } from 'sonner';

interface ExamCandidatesManagerProps {
  examId: string;
  courseId: string;
}

export const ExamCandidatesManager = ({ examId, courseId }: ExamCandidatesManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    candidates, 
    assignedCandidates, 
    assignCandidate, 
    unassignCandidate 
  } = useExamCandidates(examId);

  const handleToggleCandidate = async (candidateId: string) => {
    if (!examId) {
      toast.error("Please save the exam first");
      return;
    }

    if (assignedCandidates.includes(candidateId)) {
      await unassignCandidate(candidateId);
    } else {
      await assignCandidate(candidateId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Candidates</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Exam Candidates</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <Checkbox
                      checked={assignedCandidates.includes(candidate.id)}
                      onCheckedChange={() => handleToggleCandidate(candidate.id)}
                    />
                  </TableCell>
                  <TableCell>{candidate.displayName || 'No name'}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                </TableRow>
              ))}
              {candidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No eligible candidates found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
