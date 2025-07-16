"use client";

import { handleAuthRequest } from "@/components/utils/apiRequests";
import { useUserPostsSelector } from "@/hooks/usePostsSelector";
import { API_URL_POST } from "@/server";
import { appendUserPosts, setUserPosts } from "@/store/postSlice";
import { Post, User } from "@/types";
import axios from "axios";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import PostItemShort from "../Form/PostItemShort";

interface PostsProps {
  userProfile: User;
  isOwnProfile: boolean;
}

const Posts = ({ userProfile, isOwnProfile }: PostsProps) => {
  const dispatch = useDispatch();
  const posts = useUserPostsSelector();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const observer = useRef<IntersectionObserver | null>(null);

  // Load initial user posts
  useEffect(() => {
    if (!userProfile?._id) return;

    // Reset pagination state when user changes
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);

    const getUserPosts = async () => {
      const getUserPostsReq = async () =>
        await axios.get(
          `${API_URL_POST}/user/${userProfile._id}?page=1&limit=12`,
          {
            withCredentials: true,
          }
        );
      const result = await handleAuthRequest(
        null,
        getUserPostsReq,
        setIsLoading
      );
      if (result) {
        dispatch(setUserPosts(result.data.data.posts));
        setHasMore(result.data.data.pagination?.hasMore || false);
        setTotalPosts(result.data.data.pagination?.totalPosts || 0);
        setPage(2); // Next page to load
      }
    };
    getUserPosts();
  }, [userProfile?._id, dispatch]);

  // Load more user posts
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore || !userProfile?._id) return;

    setIsLoadingMore(true);
    try {
      const getUserPostsReq = async () =>
        await axios.get(
          `${API_URL_POST}/user/${userProfile._id}?page=${page}&limit=12`,
          {
            withCredentials: true,
          }
        );
      const result = await handleAuthRequest(null, getUserPostsReq);
      if (result && result.data.data.posts.length > 0) {
        // Append new posts to existing ones
        dispatch(appendUserPosts(result.data.data.posts));
        setHasMore(result.data.data.pagination?.hasMore || false);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more user posts:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [dispatch, page, hasMore, isLoadingMore, userProfile?._id]);

  // Intersection Observer callback
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore, loadMorePosts]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (posts.length < 1) {
    return (
      <div className="flex flex-col w-full h-screen items-center ">
        <div className="flex flex-col gap-10 mt-20">
          <h1 className="text-3xl font-bold text-center">No Posts Yet</h1>
          <p className="text-lg text-gray-600 text-center mb-10">
            {isOwnProfile
              ? "You haven't posted any posts yet."
              : "This user hasn't posted any posts yet."}
          </p>
          <Image
            src="/images/no-posts-yet.png"
            alt="No Posts Yet"
            width={500}
            height={500}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* Post count display */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm">
          {totalPosts === 1 ? "1 post" : `${totalPosts} posts`}
        </p>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post: Post, index: number) => {
          // Attach ref to the last post for infinite scrolling
          if (posts.length === index + 1) {
            return (
              <div ref={lastPostElementRef} key={post._id}>
                <PostItemShort post={post} />
              </div>
            );
          } else {
            return <PostItemShort key={post._id} post={post} />;
          }
        })}
      </div>

      {/* Loading indicator for more posts */}
      {isLoadingMore && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading more posts...</span>
        </div>
      )}

      {/* End message when no more posts */}
      {!hasMore && posts.length > 12 && (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500">
            You&apos;ve reached the end of all posts
          </p>
        </div>
      )}
    </div>
  );
};
export default Posts;
