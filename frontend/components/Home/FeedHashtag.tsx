"use client";

import PageLoader from "@/components/Form/PageLoader";
import { handleAuthRequest } from "@/components/utils/apiRequests";
import useGetUser from "@/hooks/useGetUser";
import { useHashtagPostsSelector } from "@/hooks/usePostsSelector";
import { API_URL_POST } from "@/server";
import { appendHashtagPosts, setHashtagPosts } from "@/store/postSlice";
import axios from "axios";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import PostItem from "../Form/PostItem";

// This would be your hashtag search/feed page
interface FeedHashtagProps {
  hashtag: string;
}

export default function FeedHashtag({ hashtag }: FeedHashtagProps) {
  const dispatch = useDispatch();
  const { user } = useGetUser();
  const posts = useHashtagPostsSelector();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const observer = useRef<IntersectionObserver | null>(null);

  // Load initial posts for hashtag
  useEffect(() => {
    // Reset pagination state when hashtag changes
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);

    const getAllPost = async () => {
      const getAllPostReq = async () =>
        await axios.get(
          `${API_URL_POST}/by-hashtag/${hashtag}?page=1&limit=10`,
          {
            withCredentials: true,
          }
        );
      const result = await handleAuthRequest(null, getAllPostReq, setIsLoading);
      if (result) {
        dispatch(setHashtagPosts(result.data.data.posts));
        setHasMore(result.data.data.pagination?.hasMore || false);
        setTotalPosts(result.data.data.pagination?.totalPosts || 0);
        setPage(2); // Next page to load
      }
    };
    getAllPost();
  }, [hashtag, dispatch]);

  // Load more posts for hashtag
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const getAllPostReq = async () =>
        await axios.get(
          `${API_URL_POST}/by-hashtag/${hashtag}?page=${page}&limit=10`,
          {
            withCredentials: true,
          }
        );
      const result = await handleAuthRequest(null, getAllPostReq);
      if (result && result.data.data.posts.length > 0) {
        // Append new posts to existing ones
        dispatch(appendHashtagPosts(result.data.data.posts));
        setHasMore(result.data.data.pagination?.hasMore || false);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more hashtag posts:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [dispatch, page, hasMore, isLoadingMore, hashtag]);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLikeDislike = async (id: string) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveUnsave = async (id: string) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleComment = async (id: string) => {};

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <PageLoader />
      </div>
    );
  }

  if (posts.length < 1) {
    return (
      <div className="flex flex-col w-full h-screen items-center ">
        <div className="flex flex-col gap-10 mt-20">
          <h1 className="text-3xl font-bold text-center">No Posts Yet</h1>
          <p className="text-lg text-gray-600 text-center mb-10">
            Be the first to post something great!
          </p>
          <Image
            src="/images/no-posts-yet.png"
            alt="No Posts Yet"
            width={980}
            height={980}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-10 md:mt-20 px-2 w-full md:w-[70%] md:px-0 mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">
          Posts for <span className="text-sky-600">#{hashtag}</span>
        </h1>
        <p className="text-gray-600 text-sm">
          {totalPosts === 1 ? "1 post found" : `${totalPosts} posts found`}
        </p>
      </div>
      <div className="">
        {posts.map((post, index) => {
          // Attach ref to the last post for infinite scrolling
          if (posts.length === index + 1) {
            return (
              <div ref={lastPostElementRef} key={post._id}>
                <PostItem
                  post={post}
                  user={user}
                  showOwner={true}
                  imageClassName="max-h-[60vh] object-cover rounded-lg"
                />
              </div>
            );
          } else {
            return (
              <PostItem
                key={post._id}
                post={post}
                user={user}
                showOwner={true}
                imageClassName="max-h-[60vh] object-cover rounded-lg"
              />
            );
          }
        })}

        {/* Loading indicator for more posts */}
        {isLoadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading more posts...</span>
          </div>
        )}

        {/* End message when no more posts */}
        {!hasMore && posts.length > 10 && (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">
              You&apos;ve reached the end of posts for #{hashtag}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
