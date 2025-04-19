
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface QuestionMainFormProps {
  form: UseFormReturn<any>;
}

const QuestionMainForm = ({ form }: QuestionMainFormProps) => {
  return (
    <FormField
      control={form.control}
      name="text"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Question Text</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Enter question text"
              className="resize-none"
              rows={3}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default QuestionMainForm;
