
import { utils, writeFileXLSX } from "xlsx";
import { toast } from "sonner";
import { Subject } from "@/types/subject.types";

export const downloadTemplate = (subjects: Subject[]) => {
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
