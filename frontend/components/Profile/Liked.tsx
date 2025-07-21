"use client";

import PostsSection from "@/components/features/profile/PostsSection";
import { useLikedPostsSelector } from "@/hooks/usePostsSelector";
import { setLikedPosts } from "@/store/postSlice";
import { User } from "@/types";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

interface LikedProps {
  userProfile: User;
  isOwnProfile?: boolean;
}

const Liked = ({ userProfile, isOwnProfile }: LikedProps) => {
  const dispatch = useDispatch();
  const posts = useLikedPostsSelector();

  // Clear liked posts when component mounts to prevent duplicates from previous sessions
  useEffect(() => {
    dispatch(setLikedPosts([]));
  }, [userProfile._id, dispatch]);

  return (
    <PostsSection
      type="liked"
      userProfile={userProfile}
      isOwnProfile={isOwnProfile}
      posts={posts}
      className="w-full"
    />
  );
};

export default Liked;
