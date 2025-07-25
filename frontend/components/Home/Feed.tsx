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

  useEffect(() => {
    dispatch(setPosts([]));
  }, [dispatch]);

  // Fetch function for infinite scroll
  const fetchPosts = useCallback(async (page: number) => {
    const response = await axios.get(
      `${API_URL_POST}/all?page=${page}&limit=10&_t=${Date.now()}`, // Add timestamp to prevent caching
      {
        withCredentials: true,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
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
    reset: resetInfiniteScroll,
  } = useInfiniteScroll<Post>({
    fetchFunction: fetchPosts,
    dependencies: [user?._id], // Reset when user changes
  });

  // Force refresh when Redux store is empty but we need data
  useEffect(() => {
    if (
      user &&
      posts.length === 0 &&
      infiniteScrollPosts.length === 0 &&
      !isLoading
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log("🔄 Feed: Redux store empty, forcing data refresh...");
      }
      resetInfiniteScroll();
    }
  }, [
    user,
    posts.length,
    infiniteScrollPosts.length,
    isLoading,
    resetInfiniteScroll,
  ]);

  // Sync infinite scroll data with Redux store
  useEffect(() => {
    if (infiniteScrollPosts.length > 0) {
      if (posts.length === 0) {
        if (process.env.NODE_ENV === "development") {
          //Initial load or refresh - always set the posts
          console.log(
            "🔄 Feed: Setting initial posts to Redux store",
            infiniteScrollPosts.length
          );
        }
        dispatch(setPosts(infiniteScrollPosts));
      } else if (infiniteScrollPosts.length > posts.length) {
        // Append new posts only if infinite scroll has more posts
        const newPosts = infiniteScrollPosts.slice(posts.length);
        if (newPosts.length > 0) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              "📥 Feed: Appending new posts to Redux store",
              newPosts.length
            );
          }
          dispatch(appendPosts(newPosts));
        }
      }
    } else if (
      posts.length > 0 &&
      infiniteScrollPosts.length === 0 &&
      !isLoading
    ) {
      if (process.env.NODE_ENV === "development") {
        //Redux has posts but infinite scroll is empty (shouldn't happen, but handle it)
        console.log(
          "⚠️ Feed: Redux has posts but infinite scroll is empty, keeping Redux data"
        );
      }
      dispatch(setPosts([]));
    }
  }, [infiniteScrollPosts, posts.length, dispatch, isLoading]);

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
