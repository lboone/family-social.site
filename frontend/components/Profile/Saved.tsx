"use client";

import PostsSection from "@/components/features/profile/PostsSection";
import { useSavedPostsSelector } from "@/hooks/usePostsSelector";
import { setSavedPosts } from "@/store/postSlice";
import { User } from "@/types";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

interface SavedProps {
  userProfile: User;
  isOwnProfile?: boolean;
}

const Saved = ({ userProfile, isOwnProfile }: SavedProps) => {
  const dispatch = useDispatch();
  const posts = useSavedPostsSelector();

  // Clear saved posts when component mounts to prevent duplicates from previous sessions
  useEffect(() => {
    dispatch(setSavedPosts([]));
  }, [userProfile._id, dispatch]);

  return (
    <PostsSection
      type="saved"
      userProfile={userProfile}
      isOwnProfile={isOwnProfile}
      posts={posts}
      className="w-full"
    />
  );
};

export default Saved;
