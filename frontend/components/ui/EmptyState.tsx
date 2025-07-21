import { cn } from "@/lib/utils";
import Image from "next/image";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  image?: string;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  action,
  icon,
  image,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20",
        className
      )}
    >
      {image && (
        <div className="mb-6">
          <Image
            src={image}
            alt={title}
            width={200}
            height={200}
            className="w-48 h-48 object-cover opacity-80"
          />
        </div>
      )}

      {icon && !image && <div className="mb-6 text-gray-400">{icon}</div>}

      <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
        {title}
      </h2>

      <p className="text-gray-500 text-center mb-6 max-w-md">{description}</p>

      {action && action}
    </div>
  );
}
