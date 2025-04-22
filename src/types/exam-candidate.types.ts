
export interface ExamCandidate {
  id: string;
  email: string;
  displayName: string | null;
}

export interface ExamCandidateAssignment {
  id?: string;
  examId: string;
  candidateId: string;
  assignedAt?: Date;
  status: 'pending' | 'scheduled' | 'available' | 'completed';
  createdAt?: Date;
}
