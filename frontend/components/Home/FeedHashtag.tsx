"use client";

import PostList from "@/components/common/PostList";
import useGetUser from "@/hooks/useGetUser";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useHashtagPostsSelector } from "@/hooks/usePostsSelector";
import { API_URL_POST } from "@/server";
import { appendHashtagPosts, setHashtagPosts } from "@/store/postSlice";
import { Post } from "@/types";
import axios from "axios";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import DynamicBreadcrumb from "../Breadcrumb/DynamicBreadcrumb";

interface FeedHashtagProps {
  hashtag: string;
}

export default function FeedHashtag({ hashtag }: FeedHashtagProps) {
  const dispatch = useDispatch();
  const { user } = useGetUser();
  const posts = useHashtagPostsSelector();

  // Fetch function for infinite scroll
  const fetchPosts = useCallback(
    async (page: number) => {
      const response = await axios.get(
        `${API_URL_POST}/by-hashtag/${hashtag}?page=${page}&limit=10`,
        { withCredentials: true }
      );

      const { posts: newPosts, pagination } = response.data.data;

      return {
        data: newPosts,
        hasMore: pagination?.hasMore || false,
        totalCount: pagination?.totalPosts,
      };
    },
    [hashtag]
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
    dependencies: [hashtag],
    resetTrigger: hashtag,
  });

  // Sync infinite scroll data with Redux store
  useEffect(() => {
    if (infiniteScrollPosts.length > 0) {
      if (posts.length === 0) {
        // Initial load
        dispatch(setHashtagPosts(infiniteScrollPosts));
      } else {
        // Append new posts
        const newPosts = infiniteScrollPosts.slice(posts.length);
        if (newPosts.length > 0) {
          dispatch(appendHashtagPosts(newPosts));
        }
      }
    }
  }, [infiniteScrollPosts, posts.length, dispatch]);

  return (
    <div className="flex flex-col px-2 w-full md:w-[70%] md:px-0 mx-auto">
      <div className="mt-10 mb-10">
        <DynamicBreadcrumb className="mb-4" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">#{hashtag}</h1>
        <p className="text-lg text-gray-600 text-center">
          {totalCount !== undefined ? `${totalCount} posts` : "Posts"} tagged
          with #{hashtag}
        </p>
      </div>

      <PostList
        posts={posts}
        user={user}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        lastElementRef={lastElementRef}
        emptyStateTitle={`No posts found for #${hashtag}`}
        emptyStateDescription="Be the first to post with this hashtag!"
        loadingMoreText="Loading more posts..."
        endMessage={`You've reached the end of posts for #${hashtag}`}
      />
    </div>
  );
}
