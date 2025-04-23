
// Re-export all API functions
import { fetchExamsFromApi } from './fetchExams';
import { createExamInApi } from './createExam';
import { updateExamInApi } from './updateExam';
import { deleteExamInApi } from './deleteExam';
import { updateExamStatusInApi } from './updateExamStatus';

export {
  fetchExamsFromApi,
  createExamInApi,
  updateExamInApi,
  deleteExamInApi,
  updateExamStatusInApi
};
