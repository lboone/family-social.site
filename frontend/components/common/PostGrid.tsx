import { cn } from "@/lib/utils";
import { Post } from "@/types";
import PostItemShort from "../Form/PostItemShort";
import InfiniteScrollContainer from "./InfiniteScrollContainer";

interface PostGridProps {
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  lastElementRef: (node: HTMLElement | null) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateImage?: string;
  loadingMoreText?: string;
  endMessage?: string;
  className?: string;
  gridClassName?: string;
  showStats?: boolean;
  totalCount?: number;
}

export default function PostGrid({
  posts,
  isLoading,
  isLoadingMore,
  hasMore,
  lastElementRef,
  emptyStateTitle = "No Posts Found",
  emptyStateDescription = "No posts to display.",
  emptyStateImage = "/images/no-posts-yet.png",
  loadingMoreText = "Loading more posts...",
  endMessage = "You've reached the end of all posts",
  className,
  gridClassName,
  showStats = false,
  totalCount,
}: PostGridProps) {
  const renderPost = (
    post: Post,
    index: number,
    ref?: React.Ref<HTMLElement>
  ) => {
    const isLastItem = posts.length === index + 1;

    if (isLastItem && ref) {
      return (
        <div ref={ref as React.Ref<HTMLDivElement>} key={post._id}>
          <PostItemShort post={post} />
        </div>
      );
    }

    return <PostItemShort key={post._id} post={post} />;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Stats header */}
      {showStats && totalCount !== undefined && posts.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Showing {posts.length} of {totalCount} posts
          </p>
        </div>
      )}

      <InfiniteScrollContainer
        items={posts}
        renderItem={renderPost}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        lastElementRef={lastElementRef}
        emptyStateTitle={emptyStateTitle}
        emptyStateDescription={emptyStateDescription}
        emptyStateImage={emptyStateImage}
        loadingMoreText={loadingMoreText}
        endMessage={endMessage}
        containerClassName={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2",
          gridClassName
        )}
        minItemsForEndMessage={12}
      />
    </div>
  );
}
