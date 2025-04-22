
import { Subject } from "@/types/subject.types";

export const findSubjectId = (subjectName: string, subjects: Subject[]): string | null => {
  // Improved subject matching logic - more lenient matching
  // Convert subject names to lowercase and trim whitespace for comparison
  const normalizedSubjectName = subjectName.toLowerCase().trim();
  
  // First try exact match
  const exactMatch = subjects.find(s => 
    s.title.toLowerCase().trim() === normalizedSubjectName
  );
  
  if (exactMatch) return exactMatch.id;
  
  // If no exact match, try case-insensitive contains match
  const partialMatch = subjects.find(s => 
    s.title.toLowerCase().includes(normalizedSubjectName) || 
    normalizedSubjectName.includes(s.title.toLowerCase())
  );
  
  return partialMatch ? partialMatch.id : null;
};
