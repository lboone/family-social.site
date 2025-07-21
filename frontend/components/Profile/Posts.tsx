"use client";

import PostsSection from "@/components/features/profile/PostsSection";
import { useUserPostsSelector } from "@/hooks/usePostsSelector";
import { setUserPosts } from "@/store/postSlice";
import { User } from "@/types";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

interface PostsProps {
  userProfile: User;
  isOwnProfile?: boolean;
}

const Posts = ({ userProfile, isOwnProfile }: PostsProps) => {
  const dispatch = useDispatch();
  const posts = useUserPostsSelector();

  // Clear user posts when component mounts to prevent duplicates from previous sessions
  useEffect(() => {
    dispatch(setUserPosts([]));
  }, [userProfile._id, dispatch]);

  return (
    <PostsSection
      type="posts"
      userProfile={userProfile}
      isOwnProfile={isOwnProfile}
      posts={posts}
      className="w-full"
    />
  );
};

export default Posts;
