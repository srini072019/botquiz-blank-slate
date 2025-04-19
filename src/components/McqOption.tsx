
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface McqOptionProps {
  text: string;
  onClick: () => void;
  isSelected?: boolean;
  isCorrect?: boolean | null;
}

export const McqOption = ({ text, onClick, isSelected = false, isCorrect = null }: McqOptionProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 mb-2 rounded-lg text-left transition-all",
        "border hover:border-indigo-600",
        isSelected && "border-indigo-600 bg-indigo-50",
        isCorrect === true && "border-emerald-600 bg-emerald-50",
        isCorrect === false && "border-rose-600 bg-rose-50"
      )}
      disabled={isCorrect !== null}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm">{text}</span>
        {isCorrect === true && <Check className="w-5 h-5 text-emerald-600" />}
        {isCorrect === false && <X className="w-5 h-5 text-rose-600" />}
      </div>
    </button>
  );
};
