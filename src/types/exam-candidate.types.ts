
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

// Database column mapping (used for queries)
export const examCandidateAssignmentColumns = {
  id: 'id',
  examId: 'exam_id',
  candidateId: 'candidate_id',
  assignedAt: 'assigned_at',
  status: 'status',
  createdAt: 'created_at'
};
