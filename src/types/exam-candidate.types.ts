
export interface ExamCandidate {
  id: string;
  email: string;
  displayName: string | null;
}

export interface ExamCandidateAssignment {
  examId: string;
  candidateId: string;
  assignedAt: Date;
  status: 'pending' | 'completed';
}
