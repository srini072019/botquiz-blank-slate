import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { QuestionType, DifficultyLevel } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import QuestionOptions from "./QuestionOptions";
import QuestionMainForm from "./form/QuestionMainForm";
import QuestionMetadata from "./form/QuestionMetadata";

const questionSchema = z.object({
  text: z.string().min(5, "Question text must be at least 5 characters"),
  type: z.nativeEnum(QuestionType),
  subjectId: z.string().min(1, "Subject is required"),
  difficultyLevel: z.nativeEnum(DifficultyLevel),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string().min(1, "Option text is required"),
      isCorrect: z.boolean(),
    })
  ).nonempty("At least one option is required"),
});

interface QuestionFormProps {
  initialData?: {
    text?: string;
    type?: QuestionType;
    subjectId?: string;
    difficultyLevel?: DifficultyLevel;
    explanation?: string;
    options?: { id: string; text: string; isCorrect: boolean }[];
  };
  subjects: Subject[];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const QuestionForm = ({
  initialData,
  subjects,
  onSubmit,
  isSubmitting,
}: QuestionFormProps) => {
  const form = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: initialData?.text || "",
      type: initialData?.type || QuestionType.MULTIPLE_CHOICE,
      subjectId: initialData?.subjectId || "",
      difficultyLevel: initialData?.difficultyLevel || DifficultyLevel.MEDIUM,
      options: initialData?.options || [
        { id: uuidv4(), text: "", isCorrect: false },
        { id: uuidv4(), text: "", isCorrect: false },
        { id: uuidv4(), text: "", isCorrect: false },
        { id: uuidv4(), text: "", isCorrect: false },
      ],
    },
  });

  const questionType = form.watch("type");

  const addOption = () => {
    const currentOptions = form.getValues("options");
    form.setValue("options", [
      ...currentOptions,
      { id: uuidv4(), text: "", isCorrect: false },
    ]);
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues("options");
    form.setValue(
      "options",
      currentOptions.filter((_, i) => i !== index)
    );
  };

  const handleCorrectOption = (index: number, checked: boolean) => {
    const currentOptions = form.getValues("options");
    
    if (questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.TRUE_FALSE) {
      const updatedOptions = currentOptions.map((option, i) => ({
        ...option,
        isCorrect: i === index ? checked : false,
      }));
      form.setValue("options", updatedOptions);
    } else {
      const updatedOptions = [...currentOptions];
      updatedOptions[index].isCorrect = checked;
      form.setValue("options", updatedOptions);
    }
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    form.setValue("type", type);
    
    if (type === QuestionType.TRUE_FALSE) {
      form.setValue("options", [
        { id: uuidv4(), text: "True", isCorrect: false },
        { id: uuidv4(), text: "False", isCorrect: false },
      ]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <QuestionMainForm form={form} />
        <QuestionMetadata 
          form={form} 
          subjects={subjects} 
          onQuestionTypeChange={handleQuestionTypeChange}
        />
        <QuestionOptions 
          form={form}
          questionType={form.watch("type")}
          addOption={addOption}
          removeOption={removeOption}
          handleCorrectOption={handleCorrectOption}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Question"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuestionForm;
