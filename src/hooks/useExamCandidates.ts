
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExamCandidate } from '@/types/exam-candidate.types';
import { toast } from 'sonner';

export const useExamCandidates = (examId: string) => {
  const [candidates, setCandidates] = useState<ExamCandidate[]>([]);
  const [assignedCandidates, setAssignedCandidates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEligibleCandidates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('eligible_candidates')
        .select('*');

      if (error) throw error;
      
      // Transform the data to match the ExamCandidate type
      const formattedCandidates: ExamCandidate[] = data.map(candidate => ({
        id: candidate.id || '',
        email: candidate.email || '',
        displayName: candidate.display_name || null
      }));
      
      setCandidates(formattedCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load eligible candidates');
    }
  }, []);

  const fetchAssignedCandidates = useCallback(async () => {
    if (!examId) return;
    
    try {
      const { data, error } = await supabase
        .from('exam_candidate_assignments')
        .select('candidate_id')
        .eq('exam_id', examId);

      if (error) throw error;
      setAssignedCandidates(data.map(assignment => assignment.candidate_id));
    } catch (error) {
      console.error('Error fetching assigned candidates:', error);
      toast.error('Failed to load assigned candidates');
    }
  }, [examId]);

  const assignCandidate = async (candidateId: string) => {
    try {
      const { error } = await supabase
        .from('exam_candidate_assignments')
        .insert({
          exam_id: examId,
          candidate_id: candidateId,
        });

      if (error) throw error;
      
      await fetchAssignedCandidates();
      toast.success('Candidate assigned successfully');
    } catch (error) {
      console.error('Error assigning candidate:', error);
      toast.error('Failed to assign candidate');
    }
  };

  const unassignCandidate = async (candidateId: string) => {
    try {
      const { error } = await supabase
        .from('exam_candidate_assignments')
        .delete()
        .eq('exam_id', examId)
        .eq('candidate_id', candidateId);

      if (error) throw error;
      
      await fetchAssignedCandidates();
      toast.success('Candidate unassigned successfully');
    } catch (error) {
      console.error('Error unassigning candidate:', error);
      toast.error('Failed to unassign candidate');
    }
  };

  useEffect(() => {
    fetchEligibleCandidates();
    if (examId) {
      fetchAssignedCandidates();
    }
  }, [fetchEligibleCandidates, fetchAssignedCandidates, examId]);

  return {
    candidates,
    assignedCandidates,
    isLoading,
    assignCandidate,
    unassignCandidate
  };
};
