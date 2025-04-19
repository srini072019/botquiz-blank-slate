import { useState, useMemo } from "react";
import { Question, DifficultyLevel } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import QuestionTableHeader from "./table/QuestionTableHeader";
import QuestionActions from "./table/QuestionActions";
import QuestionTablePagination from "./table/QuestionTablePagination";

interface QuestionTableProps {
  questions: Question[];
  subjects: Subject[];
}

const QuestionTable = ({ questions, subjects }: QuestionTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all-subjects");
  const [filterDifficulty, setFilterDifficulty] = useState("all-difficulty");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const subjectMap = useMemo(() => {
    const map = new Map<string, string>();
    subjects.forEach(subject => map.set(subject.id, subject.title));
    return map;
  }, [subjects]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const matchesSearch = searchQuery === "" || 
        question.text.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = filterSubject === "all-subjects" || 
        question.subjectId === filterSubject;
        
      const matchesDifficulty = filterDifficulty === "all-difficulty" || 
        question.difficultyLevel === filterDifficulty;
        
      return matchesSearch && matchesSubject && matchesDifficulty;
    });
  }, [questions, searchQuery, filterSubject, filterDifficulty]);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(startIndex, startIndex + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));

  const handleFilterChange = (subject: string) => {
    setFilterSubject(subject);
    setCurrentPage(1);
  };

  const handleDifficultyChange = (difficulty: string) => {
    setFilterDifficulty(difficulty);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size));
    setCurrentPage(1);
  };

  const getDifficultyColor = (level: DifficultyLevel) => {
    switch (level) {
      case DifficultyLevel.EASY:
        return "bg-green-100 text-green-800";
      case DifficultyLevel.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case DifficultyLevel.HARD:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <QuestionTableHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filterSubject={filterSubject}
        onFilterChange={handleFilterChange}
        subjects={subjects}
        filterDifficulty={filterDifficulty}
        onDifficultyChange={handleDifficultyChange}
      />

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Options</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuestions.length > 0 ? (
              paginatedQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    {question.text}
                  </TableCell>
                  <TableCell>
                    {question.type === "multiple_choice"
                      ? "Multiple Choice"
                      : question.type === "true_false"
                      ? "True/False"
                      : "Multiple Answer"}
                  </TableCell>
                  <TableCell>{subjectMap.get(question.subjectId)}</TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(question.difficultyLevel)}>
                      {question.difficultyLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{question.options.length}</TableCell>
                  <TableCell>
                    <QuestionActions question={question} subjects={subjects} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No questions found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredQuestions.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default QuestionTable;
