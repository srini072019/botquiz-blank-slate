
import { useState } from "react";
import { X, PlusCircle } from "lucide-react";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { QuestionType } from "@/types/question.types";
import { UseFormReturn } from "react-hook-form";

interface QuestionOptionsProps {
  form: UseFormReturn<any>;
  questionType: QuestionType;
  addOption: () => void;
  removeOption: (index: number) => void;
  handleCorrectOption: (index: number, checked: boolean) => void;
}

const QuestionOptions = ({
  form,
  questionType,
  addOption,
  removeOption,
  handleCorrectOption,
}: QuestionOptionsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">Options</h3>
        {questionType !== QuestionType.TRUE_FALSE && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
          >
            <PlusCircle size={16} className="mr-1" /> Add Option
          </Button>
        )}
      </div>

      {form.watch("options").map((option: any, index: number) => (
        <div key={option.id} className="flex items-start space-x-2">
          <FormField
            control={form.control}
            name={`options.${index}.isCorrect`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0 mt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      handleCorrectOption(index, checked as boolean)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`options.${index}.text`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    placeholder="Option text"
                    {...field}
                    disabled={
                      questionType === QuestionType.TRUE_FALSE && index < 2
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {questionType !== QuestionType.TRUE_FALSE && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeOption(index)}
              disabled={form.watch("options").length <= 2}
            >
              <X size={16} />
            </Button>
          )}
        </div>
      ))}
      {form.formState.errors.options && (
        <p className="text-sm font-medium text-destructive">
          {String(form.formState.errors.options.message)}
        </p>
      )}
    </div>
  );
};

export default QuestionOptions;
