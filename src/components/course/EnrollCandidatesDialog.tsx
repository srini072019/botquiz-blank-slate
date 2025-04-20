
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useExamCandidates } from "@/hooks/useExamCandidates";
import { useEnrollment } from "@/hooks/useEnrollment";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EnrollCandidatesDialogProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

const EnrollCandidatesDialog = ({ courseId, isOpen, onClose }: EnrollCandidatesDialogProps) => {
  const { candidates } = useExamCandidates(courseId);
  const { enrollParticipants, isLoading } = useEnrollment();
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const handleEnroll = async () => {
    if (selectedEmails.length === 0) {
      toast.error("Please select at least one candidate");
      return;
    }
    
    try {
      const result = await enrollParticipants(courseId, selectedEmails);
      if (result.success) {
        setSelectedEmails([]);
        toast.success(result.message || "Candidates enrolled successfully");
        onClose();
      } else {
        toast.error(result.message || "Failed to add candidates");
      }
    } catch (error) {
      console.error("Error in enrollment process:", error);
      toast.error("An unexpected error occurred while enrolling candidates");
    }
  };

  const toggleCandidate = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Enroll Candidates</DialogTitle>
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
              {candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(candidate.email || '')}
                        onChange={() => candidate.email && toggleCandidate(candidate.email)}
                        className="h-4 w-4"
                        disabled={!candidate.email}
                      />
                    </TableCell>
                    <TableCell>{candidate.displayName || 'No name'}</TableCell>
                    <TableCell>{candidate.email || 'No email'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No eligible candidates found. Make sure candidates are added to the system.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleEnroll} 
            disabled={selectedEmails.length === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              'Enroll Selected'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollCandidatesDialog;
