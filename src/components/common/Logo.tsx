
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ 
  className, 
  textClassName,
  size = "md", 
  showText = true 
}: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <GraduationCap className={cn("text-assessify-primary", sizeClasses[size])} />
      {showText && (
        <span className={cn(
          "font-bold tracking-tight", 
          textSizeClasses[size],
          textClassName
        )}>
          Assessify
        </span>
      )}
    </div>
  );
};

export default Logo;
