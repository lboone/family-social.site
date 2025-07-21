"use client";

import PostsSection from "@/components/features/profile/PostsSection";
import { useFollowingPostsSelector } from "@/hooks/usePostsSelector";
import { setFollowingPosts } from "@/store/postSlice";
import { User } from "@/types";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

interface FollowingProps {
  userProfile: User;
  isOwnProfile?: boolean;
}

const Following = ({ userProfile, isOwnProfile }: FollowingProps) => {
  const dispatch = useDispatch();
  const posts = useFollowingPostsSelector();

  // Clear following posts when component mounts to prevent duplicates from previous sessions
  useEffect(() => {
    dispatch(setFollowingPosts([]));
  }, [userProfile._id, dispatch]);

  return (
    <PostsSection
      type="following"
      userProfile={userProfile}
      isOwnProfile={isOwnProfile}
      posts={posts}
      className="w-full"
    />
  );
};

export default Following;
