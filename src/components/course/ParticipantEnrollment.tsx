
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEnrollment } from "@/hooks/useEnrollment";
import { toast } from "sonner";

interface ParticipantEnrollmentProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ParticipantEnrollment = ({ courseId, isOpen, onClose }: ParticipantEnrollmentProps) => {
  const [emails, setEmails] = useState("");
  const { enrollParticipants, isLoading } = useEnrollment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailList = emails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emailList.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    const result = await enrollParticipants(courseId, emailList);
    if (result.success) {
      setEmails("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll Participants</DialogTitle>
          <DialogDescription>
            Enter email addresses of participants you want to enroll in this course.
            Separate multiple emails with commas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Enter email addresses (comma-separated)"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="h-32"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enrolling..." : "Enroll Participants"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantEnrollment;
