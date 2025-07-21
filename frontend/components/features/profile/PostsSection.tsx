"use client";

import PostGrid from "@/components/common/PostGrid";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { API_URL_POST } from "@/server";
import {
  appendFollowingPosts,
  appendLikedPosts,
  appendSavedPosts,
  appendUserPosts,
  setFollowingPosts,
  setLikedPosts,
  setSavedPosts,
  setUserPosts,
} from "@/store/postSlice";
import { Post, User } from "@/types";
import axios from "axios";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import NoPostsFound from "../../Profile/NoPostsFound";

type PostType = "posts" | "liked" | "saved" | "following";

interface PostsSectionProps {
  type: PostType;
  userProfile: User;
  isOwnProfile?: boolean;
  posts: Post[];
  className?: string;
}

const POST_TYPE_CONFIG = {
  posts: {
    title: "Your Posts",
    description: "Posts you have created",
    endpoint: (userId: string) => `${API_URL_POST}/user/${userId}`,
    setAction: setUserPosts,
    appendAction: appendUserPosts,
    emptyComponent: (isOwnProfile?: boolean) => (
      <NoPostsFound postType="posts" isOwnProfile={isOwnProfile} />
    ),
  },
  liked: {
    title: "Liked Posts",
    description: "Posts you have liked",
    endpoint: (userId: string) => `${API_URL_POST}/liked/${userId}`,
    setAction: setLikedPosts,
    appendAction: appendLikedPosts,
    emptyComponent: () => <NoPostsFound postType="liked" />,
  },
  saved: {
    title: "Saved Posts",
    description: "Posts you have saved",
    endpoint: (userId: string) => `${API_URL_POST}/saved/${userId}`,
    setAction: setSavedPosts,
    appendAction: appendSavedPosts,
    emptyComponent: () => <NoPostsFound postType="saved" />,
  },
  following: {
    title: "Following Posts",
    description: "Posts from people you follow",
    endpoint: (userId: string) => `${API_URL_POST}/following/${userId}`,
    setAction: setFollowingPosts,
    appendAction: appendFollowingPosts,
    emptyComponent: () => <NoPostsFound postType="following" />,
  },
};

export default function PostsSection({
  type,
  userProfile,
  isOwnProfile,
  posts,
  className,
}: PostsSectionProps) {
  const dispatch = useDispatch();
  const config = POST_TYPE_CONFIG[type];

  // Fetch function for infinite scroll
  const fetchPosts = useCallback(
    async (page: number) => {
      const response = await axios.get(
        `${config.endpoint(userProfile._id)}?page=${page}&limit=12`,
        { withCredentials: true }
      );

      const { posts: newPosts, pagination } = response.data.data;

      return {
        data: newPosts,
        hasMore: pagination?.hasMore || false,
        totalCount: pagination?.totalPosts,
      };
    },
    [config, userProfile._id]
  );

  const {
    data: infiniteScrollPosts,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    lastElementRef,
  } = useInfiniteScroll<Post>({
    fetchFunction: fetchPosts,
    dependencies: [userProfile._id],
    resetTrigger: userProfile._id,
  });

  // Sync infinite scroll data with Redux store
  useEffect(() => {
    if (infiniteScrollPosts.length > 0) {
      // Create a map of existing post IDs for quick lookup
      const existingPostIds = new Set(posts.map((post) => post._id));

      if (posts.length === 0) {
        // Initial load - deduplicate just in case
        const uniquePosts = infiniteScrollPosts.filter(
          (post, index, self) =>
            index === self.findIndex((p) => p._id === post._id)
        );
        dispatch(config.setAction(uniquePosts));
      } else {
        // Append new posts - filter out duplicates
        const newPosts = infiniteScrollPosts
          .slice(posts.length)
          .filter((post) => !existingPostIds.has(post._id));

        if (newPosts.length > 0) {
          dispatch(config.appendAction(newPosts));
        }
      }
    }
  }, [infiniteScrollPosts, posts, dispatch, config]);

  // Special handling for following posts visibility
  if (type === "following" && !isOwnProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center">
        <h2 className="text-lg font-semibold text-gray-600 mb-2">
          Following Posts
        </h2>
        <p className="text-gray-500">
          You can only view your own following posts.
        </p>
      </div>
    );
  }

  // Custom empty state for no posts
  if (!isLoading && posts.length === 0) {
    return config.emptyComponent(isOwnProfile);
  }

  return (
    <div className={className}>
      {/* Section header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          {config.title} {totalCount !== undefined && `(${totalCount})`}
        </h2>
        <p className="text-sm text-gray-500">{config.description}</p>
      </div>

      {/* Posts grid */}
      <PostGrid
        posts={posts}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        lastElementRef={lastElementRef}
        emptyStateTitle={`No ${type} posts found`}
        emptyStateDescription={`No ${type} posts to display.`}
        showStats={false}
        totalCount={totalCount}
        loadingMoreText={`Loading more ${type} posts...`}
        endMessage={`You've reached the end of all ${type} posts`}
      />
    </div>
  );
}
