"use client";

import { handleAuthRequest } from "@/components/utils/apiRequests";
import { useLikedPostsSelector } from "@/hooks/usePostsSelector";
import { API_URL_POST } from "@/server";
import { appendLikedPosts, setLikedPosts } from "@/store/postSlice";
import { Post, User } from "@/types";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import PostItemShort from "../Form/PostItemShort";
import NoPostsFound from "./NoPostsFound";

interface LikedProps {
  userProfile: User;
  isOwnProfile: boolean;
}

const Liked = ({ userProfile, isOwnProfile }: LikedProps) => {
  const dispatch = useDispatch();
  const posts = useLikedPostsSelector();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const observer = useRef<IntersectionObserver | null>(null);

  // Load initial liked posts
  useEffect(() => {
    if (!userProfile?._id) return;

    // Reset pagination state when user changes
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);

    const getLikedPosts = async () => {
      const getLikedPostsReq = async () =>
        await axios.get(
          `${API_URL_POST}/liked/${userProfile._id}?page=1&limit=12`,
          {
            withCredentials: true,
          }
        );
      const result = await handleAuthRequest(
        null,
        getLikedPostsReq,
        setIsLoading
      );
      if (result) {
        dispatch(setLikedPosts(result.data.data.posts));
        setHasMore(result.data.data.pagination?.hasMore || false);
        setTotalPosts(result.data.data.pagination?.totalPosts || 0);
        setPage(2); // Next page to load
      }
    };
    getLikedPosts();
  }, [userProfile?._id, dispatch]);

  // Load more liked posts
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore || !userProfile?._id) return;

    setIsLoadingMore(true);
    try {
      const getLikedPostsReq = async () =>
        await axios.get(
          `${API_URL_POST}/liked/${userProfile._id}?page=${page}&limit=12`,
          {
            withCredentials: true,
          }
        );
      const result = await handleAuthRequest(null, getLikedPostsReq);
      if (result && result.data.data.posts.length > 0) {
        // Append new posts to existing ones
        dispatch(appendLikedPosts(result.data.data.posts));
        setHasMore(result.data.data.pagination?.hasMore || false);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more liked posts:", error);
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
    return <NoPostsFound postType="liked" />;
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Liked Posts ({totalPosts})
        </h2>
        <p className="text-sm text-gray-500">Posts you have liked</p>
      </div>

      {/* Liked posts grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {posts.map((post: Post, index: number) => {
          // Skip if post is just a string (shouldn't happen with new API)
          if (typeof post === "string") return null;

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
          <span className="ml-2 text-gray-600">
            Loading more liked posts...
          </span>
        </div>
      )}

      {/* End message when no more posts */}
      {!hasMore && posts.length > 12 && (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500">
            You&apos;ve reached the end of all liked posts
          </p>
        </div>
      )}
    </div>
  );
};
export default Liked;
