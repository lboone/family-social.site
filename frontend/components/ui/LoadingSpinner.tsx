import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const variantClasses = {
  primary: "border-blue-500",
  secondary: "border-gray-400",
};

export default function LoadingSpinner({
  size = "md",
  text,
  variant = "primary",
  className,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex justify-center items-center py-8", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-b-2",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {text && <span className="ml-2 text-gray-600">{text}</span>}
    </div>
  );
}
