
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  isBot?: boolean;
  children?: React.ReactNode;
}

export const MessageBubble = ({ content, isBot = false, children }: MessageBubbleProps) => {
  return (
    <div className={cn(
      "flex w-full mb-4",
      isBot ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "rounded-2xl p-4 max-w-[80%] shadow-sm",
        isBot ? "bg-white" : "bg-indigo-600 text-white"
      )}>
        <p className="text-sm">{content}</p>
        {children}
      </div>
    </div>
  );
};
