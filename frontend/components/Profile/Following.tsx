"use client";

import PageLoader from "@/components/Form/PageLoader";
import PostItemShort from "@/components/Form/PostItemShort";
import { handleAuthRequest } from "@/components/utils/apiRequests";
import { useFollowingPostsSelector } from "@/hooks/usePostsSelector";
import { API_URL_POST } from "@/server";
import { appendFollowingPosts, setFollowingPosts } from "@/store/postSlice";
import { User } from "@/types";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import NoPostsFound from "./NoPostsFound";

interface FollowingProps {
  userProfile: User;
  isOwnProfile: boolean;
}

const Following = ({ userProfile, isOwnProfile }: FollowingProps) => {
  const dispatch = useDispatch();
  const posts = useFollowingPostsSelector();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const observer = useRef<IntersectionObserver | null>(null);

  // Load initial following posts
  useEffect(() => {
    const getFollowingPosts = async () => {
      const getFollowingPostsReq = async () =>
        await axios.get(
          `${API_URL_POST}/following/${userProfile._id}?page=1&limit=12`,
          {
            withCredentials: true,
          }
        );
      const result = await handleAuthRequest(
        null,
        getFollowingPostsReq,
        setIsLoading
      );
      if (result) {
        dispatch(setFollowingPosts(result.data.data.posts));
        setHasMore(result.data.data.pagination?.hasMore || false);
        setTotalPosts(result.data.data.pagination?.totalPosts || 0);
        setPage(1);
      }
    };
    if (userProfile?._id) {
      getFollowingPosts();
    }
  }, [userProfile._id, dispatch]);

  // Load more posts function
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const getMoreFollowingPostsReq = async () =>
        await axios.get(
          `${API_URL_POST}/following/${userProfile._id}?page=${nextPage}&limit=12`,
          {
            withCredentials: true,
          }
        );
      const result = await handleAuthRequest(
        null,
        getMoreFollowingPostsReq,
        setIsLoadingMore
      );
      if (result && result.data.data.posts.length > 0) {
        dispatch(appendFollowingPosts(result.data.data.posts));
        setPage(nextPage);
        setHasMore(result.data.data.pagination?.hasMore || false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more following posts:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [dispatch, page, hasMore, isLoadingMore, userProfile._id]);

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
      <div className="w-full h-[200px] flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  // Show message if not own profile
  if (!isOwnProfile) {
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

  // Show empty state if no posts
  if (posts.length < 1) {
    return <NoPostsFound postType="following" />;
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Following Posts ({totalPosts})
        </h2>
        <p className="text-sm text-gray-500">Posts from people you follow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-2">
        {posts.map((post, index) => {
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
            You&apos;ve reached the end of following posts
          </p>
        </div>
      )}
    </div>
  );
};

export default Following;
