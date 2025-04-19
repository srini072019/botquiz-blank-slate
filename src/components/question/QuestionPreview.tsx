
import { useState, useEffect } from "react";
import { Question, QuestionType } from "@/types/question.types";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface QuestionPreviewProps {
  question: Question;
}

const QuestionPreview = ({ question }: QuestionPreviewProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Reset selected options and answer visibility when question changes
  useEffect(() => {
    setSelectedOptions([]);
    setShowAnswer(false);
  }, [question]);
  
  const handleSingleOptionChange = (value: string) => {
    if (!showAnswer) {  // Only allow changes when not showing answer
      setSelectedOptions([value]);
    }
  };

  const handleMultipleOptionChange = (optionId: string) => {
    if (!showAnswer) {  // Only allow changes when not showing answer
      setSelectedOptions(prev => 
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const handleCheckAnswer = () => {
    // Show the correct answers
    const correctOptions = question.options
      .filter(option => option.isCorrect)
      .map(option => option.id);
      
    setSelectedOptions(correctOptions);
    setShowAnswer(true);
  };

  const getOptionClass = (optionId: string, isCorrect: boolean) => {
    if (!showAnswer) {
      return selectedOptions.includes(optionId) ? "bg-blue-50 border border-blue-200" : "";
    }
    
    if (isCorrect) {
      return "bg-green-50 border border-green-200";
    }
    
    // If the user selected an incorrect option
    if (selectedOptions.includes(optionId) && !isCorrect) {
      return "bg-red-50 border border-red-200";
    }
    
    return "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{question.text}</h3>
            </div>
            
            {question.type === QuestionType.MULTIPLE_CHOICE && (
              <RadioGroup 
                value={selectedOptions[0] || ""} 
                onValueChange={handleSingleOptionChange}
              >
                {question.options && question.options.length > 0 ? (
                  question.options.map((option) => (
                    <div 
                      key={option.id} 
                      className={`flex items-center space-x-2 p-2 rounded ${getOptionClass(option.id, option.isCorrect)}`}
                    >
                      <RadioGroupItem 
                        value={option.id} 
                        id={option.id} 
                        disabled={showAnswer}
                      />
                      <Label htmlFor={option.id}>
                        {option.text}
                        {showAnswer && option.isCorrect && (
                          <span className="ml-2 text-green-600 font-medium">(Correct)</span>
                        )}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No options available</div>
                )}
              </RadioGroup>
            )}

            {question.type === QuestionType.MULTIPLE_ANSWER && (
              <div className="space-y-2">
                {question.options && question.options.length > 0 ? (
                  question.options.map((option) => (
                    <div 
                      key={option.id} 
                      className={`flex items-center space-x-2 p-2 rounded ${getOptionClass(option.id, option.isCorrect)}`}
                    >
                      <Checkbox 
                        id={option.id} 
                        checked={selectedOptions.includes(option.id)}
                        onCheckedChange={() => handleMultipleOptionChange(option.id)}
                        disabled={showAnswer}
                      />
                      <Label htmlFor={option.id}>
                        {option.text}
                        {showAnswer && option.isCorrect && (
                          <span className="ml-2 text-green-600 font-medium">(Correct)</span>
                        )}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No options available</div>
                )}
              </div>
            )}

            {question.type === QuestionType.TRUE_FALSE && (
              <RadioGroup 
                value={selectedOptions[0] || ""} 
                onValueChange={handleSingleOptionChange}
              >
                {question.options && question.options.length > 0 ? (
                  question.options.map((option) => (
                    <div 
                      key={option.id} 
                      className={`flex items-center space-x-2 p-2 rounded ${getOptionClass(option.id, option.isCorrect)}`}
                    >
                      <RadioGroupItem 
                        value={option.id} 
                        id={option.id}
                        disabled={showAnswer}
                      />
                      <Label htmlFor={option.id}>
                        {option.text}
                        {showAnswer && option.isCorrect && (
                          <span className="ml-2 text-green-600 font-medium">(Correct)</span>
                        )}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No options available</div>
                )}
              </RadioGroup>
            )}
          </div>
        </CardContent>
      </Card>

      {question.explanation && showAnswer && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-1">Explanation:</h4>
          <p className="text-sm text-gray-700">{question.explanation}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handleCheckAnswer} 
          disabled={showAnswer}
        >
          Show Answer
        </Button>
      </div>
    </div>
  );
};

export default QuestionPreview;
