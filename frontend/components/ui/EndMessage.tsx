import { cn } from "@/lib/utils";

interface EndMessageProps {
  message: string;
  className?: string;
  show?: boolean;
}

export default function EndMessage({
  message,
  className,
  show = true,
}: EndMessageProps) {
  if (!show) return null;

  return (
    <div className={cn("flex justify-center items-center py-8", className)}>
      <p className="text-gray-500 text-center">{message}</p>
    </div>
  );
}
