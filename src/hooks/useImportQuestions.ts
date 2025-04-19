
import { useState } from "react";
import { toast } from "sonner";
import { read, utils, writeFileXLSX } from "xlsx";
import { QuestionFormData, QuestionType, DifficultyLevel } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import { mapToQuestionType, mapToDifficultyLevel } from "@/utils/questionUtils";

export const useImportQuestions = (subjects: Subject[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [parsedQuestions, setParsedQuestions] = useState<QuestionFormData[]>([]);

  const resetState = () => {
    setError(null);
    setProgress(0);
    setParsedQuestions([]);
  };

  const findSubjectId = (subjectName: string): string | null => {
    const subject = subjects.find(s => 
      s.title.toLowerCase().trim() === subjectName.toLowerCase().trim()
    );
    return subject ? subject.id : null;
  };

  const parseOptions = (optionsArray: string[], correctAnswers: string, type: QuestionType) => {
    // For true/false, ensure we have only 'true' and 'false' options
    if (type === QuestionType.TRUE_FALSE) {
      return [
        { id: crypto.randomUUID(), text: "True", isCorrect: correctAnswers.toLowerCase().includes("true") || correctAnswers.includes("A") || correctAnswers.includes("1") },
        { id: crypto.randomUUID(), text: "False", isCorrect: correctAnswers.toLowerCase().includes("false") || correctAnswers.includes("B") || correctAnswers.includes("2") }
      ];
    }

    // For other question types, parse the options and mark correct ones based on the correct option letters/numbers
    const correctOptionLetters = correctAnswers
      .split(/[,;\s]/)
      .map(answer => answer.trim().toUpperCase())
      .filter(answer => answer.length > 0);

    return optionsArray
      .filter(option => option !== "")
      .map((option, index) => {
        const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
        const optionNumber = String(index + 1); // 1, 2, 3, 4...
        
        const isCorrect = correctOptionLetters.includes(optionLetter) || 
                          correctOptionLetters.includes(optionNumber);

        return {
          id: crypto.randomUUID(),
          text: option,
          isCorrect
        };
      });
  };

  const parseFileData = async (file: File): Promise<QuestionFormData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          if (!e.target || !e.target.result) {
            throw new Error("Failed to read file");
          }
          
          const data = e.target.result;
          const workbook = read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          
          // Remove header row if present
          if (jsonData.length === 0) {
            throw new Error("No data found in the file");
          }

          const headers = jsonData[0] as string[];
          const requiredHeaders = [
            'Subject', 'Question Type', 'Question Text', 
            'Option A', 'Option B', 'Correct Option'
          ];

          // Validate headers
          const missingHeaders = requiredHeaders.filter(
            header => !headers.includes(header)
          );

          if (missingHeaders.length > 0) {
            throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
          }

          // Process data rows
          const questions: QuestionFormData[] = [];
          const errors: string[] = [];
          
          // Skip header row and process each row
          for (let i = 1; i < jsonData.length; i++) {
            try {
              const row = jsonData[i] as any[];
              if (row.length === 0 || row.every(cell => cell === "")) {
                continue; // Skip empty rows
              }

              // Extract data from the row
              const subject = row[headers.indexOf('Subject')];
              const questionType = row[headers.indexOf('Question Type')];
              const questionText = row[headers.indexOf('Question Text')];
              const optionA = row[headers.indexOf('Option A')];
              const optionB = row[headers.indexOf('Option B')];
              const optionC = headers.indexOf('Option C') >= 0 ? row[headers.indexOf('Option C')] : "";
              const optionD = headers.indexOf('Option D') >= 0 ? row[headers.indexOf('Option D')] : "";
              const correctOption = row[headers.indexOf('Correct Option')];
              const difficulty = headers.indexOf('Difficulty') >= 0 ? row[headers.indexOf('Difficulty')] : "";
              
              // Basic validation
              if (!subject || !questionType || !questionText || !optionA || !optionB || !correctOption) {
                errors.push(`Row ${i + 1}: Missing required fields`);
                continue;
              }
              
              // Find subject ID
              const subjectId = findSubjectId(subject);
              if (!subjectId) {
                errors.push(`Row ${i + 1}: Subject not found: ${subject}`);
                continue;
              }
              
              // Map question type
              const mappedQuestionType = mapToQuestionType(questionType);
              
              // Create options array
              const optionsArray = [optionA, optionB, optionC, optionD].filter(opt => opt !== "");
              
              if (optionsArray.length < 2) {
                errors.push(`Row ${i + 1}: At least two options are required`);
                continue;
              }
              
              // Parse options and mark correct answers
              const options = parseOptions(optionsArray, correctOption, mappedQuestionType);
              
              if (!options.some(opt => opt.isCorrect)) {
                errors.push(`Row ${i + 1}: No correct answer specified or invalid correct option format`);
                continue;
              }
              
              // Create question object with provided difficulty
              const question: QuestionFormData = {
                text: questionText,
                type: mappedQuestionType,
                subjectId,
                difficultyLevel: mapToDifficultyLevel(difficulty),
                options,
                explanation: ""
              };
              
              questions.push(question);
              
            } catch (err) {
              errors.push(`Row ${i + 1}: ${(err as Error).message}`);
            }
          }
          
          if (errors.length > 0) {
            setError(`Found ${errors.length} errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...and ${errors.length - 5} more errors` : ''}`);
          }
          
          resolve(questions);
          
        } catch (err) {
          reject(`Failed to parse file: ${(err as Error).message}`);
        }
      };
      
      reader.onerror = () => {
        reject("Error reading file");
      };
      
      reader.readAsBinaryString(file);
    });
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    
    resetState();
    setIsLoading(true);
    
    try {
      const questions = await parseFileData(file);
      
      if (questions.length === 0) {
        toast.error("No valid questions found in the file");
        setIsLoading(false);
        return;
      }
      
      setParsedQuestions(questions);
      toast.success(`Successfully parsed ${questions.length} questions`);
      
    } catch (err) {
      console.error("Error parsing file:", err);
      setError(String(err));
      toast.error(`Error parsing file: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    try {
      // Create template data with the specified format
      const template = [
        {
          Subject: subjects.length > 0 ? subjects[0].title : "Enter Subject Name",
          "Question Type": "multiple_choice",
          "Question Text": "What is the capital of France?",
          "Option A": "Paris",
          "Option B": "London",
          "Option C": "Berlin",
          "Option D": "Madrid",
          "Correct Option": "A",
          Difficulty: "easy"
        },
        {
          Subject: subjects.length > 0 ? subjects[0].title : "Enter Subject Name",
          "Question Type": "true_false",
          "Question Text": "The Earth is flat.",
          "Option A": "True",
          "Option B": "False",
          "Option C": "",
          "Option D": "",
          "Correct Option": "B",
          Difficulty: "medium"
        },
        {
          Subject: subjects.length > 0 ? subjects[0].title : "Enter Subject Name",
          "Question Type": "multiple_answer",
          "Question Text": "Which of the following are mammals?",
          "Option A": "Dog",
          "Option B": "Fish",
          "Option C": "Cat",
          "Option D": "Spider",
          "Correct Option": "A, C",
          Difficulty: "hard"
        }
      ];

      // Convert to worksheet
      const ws = utils.json_to_sheet(template);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Questions Template");

      // Set column widths
      const colWidths = [
        { wch: 20 },  // Subject
        { wch: 15 },  // Question Type
        { wch: 40 },  // Question Text
        { wch: 20 },  // Option A
        { wch: 20 },  // Option B
        { wch: 20 },  // Option C
        { wch: 20 },  // Option D
        { wch: 15 },  // Correct Option
        { wch: 12 }   // Difficulty
      ];
      
      ws['!cols'] = colWidths;

      // Download the file
      writeFileXLSX(wb, "questions_import_template.xlsx");
      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  return {
    isLoading,
    error,
    progress,
    parsedQuestions,
    handleFileUpload,
    resetState,
    downloadTemplate
  };
};
