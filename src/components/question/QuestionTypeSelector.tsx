
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionType } from "@/types/question.types";
import { UseFormReturn } from "react-hook-form";

interface QuestionTypeSelectorProps {
  form: UseFormReturn<any>;
  onQuestionTypeChange: (type: QuestionType) => void;
}

const QuestionTypeSelector = ({ form, onQuestionTypeChange }: QuestionTypeSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Question Type</FormLabel>
          <FormControl>
            <Select
              onValueChange={(value) => onQuestionTypeChange(value as QuestionType)}
              defaultValue={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
                <SelectItem value={QuestionType.MULTIPLE_ANSWER}>Multiple Answer</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default QuestionTypeSelector;
