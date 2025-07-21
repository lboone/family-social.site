import { cn } from "@/lib/utils";
import { Post, User } from "@/types";
import PostItem from "../Form/PostItem";
import InfiniteScrollContainer from "./InfiniteScrollContainer";

interface PostListProps {
  posts: Post[];
  user: User | null;
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
  showOwner?: boolean;
  imageClassName?: string;
  postClassName?: string;
}

export default function PostList({
  posts,
  user,
  isLoading,
  isLoadingMore,
  hasMore,
  lastElementRef,
  emptyStateTitle = "No Posts Yet",
  emptyStateDescription = "Be the first to post something great!",
  emptyStateImage = "/images/no-posts-yet.png",
  loadingMoreText = "Loading more posts...",
  endMessage = "You've reached the end of posts",
  className,
  showOwner = true,
  imageClassName = "max-h-[60vh] object-cover rounded-lg",
  postClassName,
}: PostListProps) {
  const renderPost = (
    post: Post,
    index: number,
    ref?: React.Ref<HTMLElement>
  ) => {
    const isLastItem = posts.length === index + 1;

    if (isLastItem && ref) {
      return (
        <div ref={ref as React.Ref<HTMLDivElement>} key={post._id}>
          <PostItem
            post={post}
            user={user}
            showOwner={showOwner}
            imageClassName={imageClassName}
            postClassName={postClassName}
          />
        </div>
      );
    }

    return (
      <PostItem
        key={post._id}
        post={post}
        user={user}
        showOwner={showOwner}
        imageClassName={imageClassName}
        postClassName={postClassName}
      />
    );
  };

  return (
    <div className={cn("w-full", className)}>
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
        minItemsForEndMessage={10}
      />
    </div>
  );
}
