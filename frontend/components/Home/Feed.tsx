"use client";

import PostList from "@/components/common/PostList";
import useGetUser from "@/hooks/useGetUser";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { usePostsSelector } from "@/hooks/usePostsSelector";
import { API_URL_POST } from "@/server";
import { appendPosts, setPosts } from "@/store/postSlice";
import { Post } from "@/types";
import axios from "axios";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";

const Feed = () => {
  const dispatch = useDispatch();
  const { user } = useGetUser();
  const posts = usePostsSelector();

  // Fetch function for infinite scroll
  const fetchPosts = useCallback(async (page: number) => {
    const response = await axios.get(
      `${API_URL_POST}/all?page=${page}&limit=10`,
      {
        withCredentials: true,
      }
    );

    const { posts: newPosts, pagination } = response.data.data;

    return {
      data: newPosts,
      hasMore: pagination?.hasMore || false,
      totalCount: pagination?.totalPosts,
    };
  }, []);

  const {
    data: infiniteScrollPosts,
    isLoading,
    isLoadingMore,
    hasMore,
    lastElementRef,
  } = useInfiniteScroll<Post>({
    fetchFunction: fetchPosts,
    dependencies: [],
  });

  // Sync infinite scroll data with Redux store
  useEffect(() => {
    if (infiniteScrollPosts.length > 0) {
      if (posts.length === 0) {
        // Initial load
        dispatch(setPosts(infiniteScrollPosts));
      } else {
        // Append new posts
        const newPosts = infiniteScrollPosts.slice(posts.length);
        if (newPosts.length > 0) {
          dispatch(appendPosts(newPosts));
        }
      }
    }
  }, [infiniteScrollPosts, posts.length, dispatch]);

  return (
    <div className="mt-20 px-5 w-full md:w-[70%] md:px-0 mx-auto">
      <PostList
        posts={posts}
        user={user}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        lastElementRef={lastElementRef}
        emptyStateTitle="No Posts Yet"
        emptyStateDescription="Be the first to post something great!"
        emptyStateImage="/images/no-posts-yet.png"
      />
    </div>
  );
};

export default Feed;
