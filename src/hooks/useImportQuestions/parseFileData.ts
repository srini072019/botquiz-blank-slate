
import { read, utils } from "xlsx";
import { QuestionFormData, QuestionType, DifficultyLevel } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import { mapToQuestionType, mapToDifficultyLevel } from "@/utils/questionUtils";
import { parseOptions } from "./parseOptions";

export const parseFileData = async (
  file: File, 
  findSubjectId: (subjectName: string) => string | null,
  subjects: Subject[]
): Promise<QuestionFormData[]> => {
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
            
            // Create question object with provided difficulty level
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
          const errorMessage = `Found ${errors.length} errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...and ${errors.length - 5} more errors` : ''}`;
          console.error(errorMessage);
          // We'll return the questions we could parse and show warnings
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
