import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { LoaderIcon } from "lucide-react";
import { Button } from "../ui/button";

interface LoadingButtonProps extends VariantProps<typeof Button> {
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
}
const LoadingButton = ({
  isLoading,
  children,
  className,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      disabled={isLoading}
      className={cn(
        "bg_primary text-white px-4 py-6 text-lg rounded-lg",
        className
      )}
      {...props}
    >
      {isLoading ? <LoaderIcon className="animate-spin mr-2" /> : null}
      {children}
    </Button>
  );
};
export default LoadingButton;
