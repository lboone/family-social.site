import { cn } from "@/lib/utils";

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  tailPosition?: "left" | "right" | "center" | "none";
  variant?: "default" | "user" | "assistant";
}

const SpeechBubble = ({
  children,
  className,
  containerClassName,
  tailPosition = "left",
  variant = "default",
}: SpeechBubbleProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "user":
        return "bg-blue-500 text-white border-blue-500";
      case "assistant":
        return "bg-gray-100 text-gray-900 border-gray-300";
      default:
        return "bg-white text-gray-900 border-gray-300";
    }
  };

  const getTailPosition = () => {
    switch (tailPosition) {
      case "right":
        return "right-8";
      case "center":
        return "left-1/2 -translate-x-1/2";
      case "none":
        return "hidden";
      default:
        return "left-8";
    }
  };

  return (
    <div
      className={cn(
        "h-96 w-full p-6 flex items-center justify-center",
        containerClassName
      )}
    >
      <div
        className={cn(
          "relative border-2 rounded-3xl px-8 py-6 max-w-md mx-auto shadow-lg",
          getVariantStyles(),
          className
        )}
      >
        {/* Speech bubble tail */}
        <div
          className={cn(
            "absolute bottom-0 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] transform translate-y-full",
            getTailPosition(),
            variant === "user" ? "border-t-blue-500" : "border-t-white"
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-t-[22px] transform translate-y-full -z-10",
            getTailPosition(),
            variant === "user"
              ? "border-t-blue-500"
              : variant === "assistant"
              ? "border-t-gray-300"
              : "border-t-gray-300"
          )}
        />

        {/* Speech bubble content */}
        {children}
      </div>
    </div>
  );
};

export default SpeechBubble;
