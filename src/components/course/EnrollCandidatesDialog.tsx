
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useExamCandidates } from "@/hooks/useExamCandidates";
import { useEnrollment } from "@/hooks/useEnrollment";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnrollCandidatesDialogProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

const EnrollCandidatesDialog = ({ courseId, isOpen, onClose }: EnrollCandidatesDialogProps) => {
  const { candidates, isLoading: isLoadingCandidates } = useExamCandidates(courseId);
  const { enrollParticipants, isLoading: isEnrolling } = useEnrollment();
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    if (selectedEmails.length === 0) {
      toast.error("Please select at least one candidate");
      return;
    }
    
    setError(null);
    try {
      const result = await enrollParticipants(courseId, selectedEmails);
      if (result.success) {
        setSelectedEmails([]);
        toast.success(result.message || "Candidates enrolled successfully");
        onClose();
      } else {
        setError(result.message || "Failed to add candidates");
        toast.error(result.message || "Failed to add candidates");
      }
    } catch (error) {
      console.error("Error in enrollment process:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError("An unexpected error occurred while enrolling candidates");
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
        
        {error && (
          <Alert className="bg-red-50 border-red-200 text-red-800 mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4">
          {isLoadingCandidates ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
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
                          disabled={!candidate.email || isEnrolling}
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
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isEnrolling}>
            Cancel
          </Button>
          <Button 
            onClick={handleEnroll} 
            disabled={selectedEmails.length === 0 || isEnrolling}
          >
            {isEnrolling ? (
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
