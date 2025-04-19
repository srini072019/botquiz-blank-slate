
import { Badge } from "@/components/ui/badge";
import { QuestionFormData, QuestionType } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import { formatQuestionType, getDifficultyColor } from "@/utils/questionUtils";

interface ImportQuestionsReviewProps {
  questions: QuestionFormData[];
  subjects: Subject[];
}

const ImportQuestionsReview = ({ questions, subjects }: ImportQuestionsReviewProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left">Question</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Subject</th>
              <th className="px-4 py-2 text-left">Difficulty</th>
              <th className="px-4 py-2 text-left">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {questions.map((question, index) => {
              const subject = subjects.find(s => s.id === question.subjectId);
              const correctCount = question.options.filter(o => o.isCorrect).length;
              
              return (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-2 max-w-[300px] truncate">{question.text}</td>
                  <td className="px-4 py-2">
                    <Badge variant="outline">
                      {formatQuestionType(question.type)}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">{subject?.title || ''}</td>
                  <td className="px-4 py-2">
                    <Badge className={getDifficultyColor(question.difficultyLevel)}>
                      {question.difficultyLevel}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    {question.options.length} options 
                    ({correctCount} correct)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {questions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No questions parsed. Please upload a valid spreadsheet.
        </div>
      )}
    </div>
  );
};

export default ImportQuestionsReview;
