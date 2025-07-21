import { cn } from "@/lib/utils";
import EmptyState from "../ui/EmptyState";
import EndMessage from "../ui/EndMessage";
import LoadingSpinner from "../ui/LoadingSpinner";

interface InfiniteScrollContainerProps<T> {
  items: T[];
  renderItem: (
    item: T,
    index: number,
    ref?: React.Ref<HTMLElement>
  ) => React.ReactNode;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  lastElementRef: (node: HTMLElement | null) => void;
  loadingComponent?: React.ReactNode;
  emptyStateComponent?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateImage?: string;
  endMessage?: string;
  containerClassName?: string;
  loadingText?: string;
  loadingMoreText?: string;
  showEndMessage?: boolean;
  minItemsForEndMessage?: number;
}

export default function InfiniteScrollContainer<T>({
  items,
  renderItem,
  isLoading,
  isLoadingMore,
  hasMore,
  lastElementRef,
  loadingComponent,
  emptyStateComponent,
  emptyStateTitle = "No items found",
  emptyStateDescription = "There are no items to display.",
  emptyStateImage,
  endMessage = "You've reached the end of all items",
  containerClassName,
  loadingText = "Loading...",
  loadingMoreText = "Loading more items...",
  showEndMessage = true,
  minItemsForEndMessage = 10,
}: InfiniteScrollContainerProps<T>) {
  // Show loading spinner for initial load
  if (isLoading) {
    return loadingComponent || <LoadingSpinner size="lg" text={loadingText} />;
  }

  // Show empty state if no items
  if (items.length === 0) {
    return (
      emptyStateComponent || (
        <EmptyState
          title={emptyStateTitle}
          description={emptyStateDescription}
          image={emptyStateImage}
        />
      )
    );
  }

  return (
    <div className={cn("w-full", containerClassName)}>
      {/* Render items */}
      {items.map((item, index) => {
        // Attach ref to the last item for infinite scrolling
        const isLastItem = items.length === index + 1;
        return renderItem(item, index, isLastItem ? lastElementRef : undefined);
      })}

      {/* Loading indicator for more items */}
      {isLoadingMore && <LoadingSpinner text={loadingMoreText} />}

      {/* End message when no more items */}
      <EndMessage
        message={endMessage}
        show={
          showEndMessage && !hasMore && items.length >= minItemsForEndMessage
        }
      />
    </div>
  );
}
