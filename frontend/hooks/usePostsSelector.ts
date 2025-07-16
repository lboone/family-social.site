import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export const usePostsSelector = () => {
  return useSelector((state: RootState) => {
    try {
      // Handle cases where state or state.post might be undefined during rehydration
      if (!state || !state.post || !state.post.posts) {
        return [];
      }
      return Array.isArray(state.post.posts) ? state.post.posts : [];
    } catch (error) {
      console.warn("Error accessing posts from Redux state:", error);
      return [];
    }
  });
};

export const useHashtagPostsSelector = () => {
  return useSelector((state: RootState) => {
    try {
      // Handle cases where state or state.post might be undefined during rehydration
      if (!state || !state.post || !state.post.hashtagPosts) {
        return [];
      }
      return Array.isArray(state.post.hashtagPosts)
        ? state.post.hashtagPosts
        : [];
    } catch (error) {
      console.warn("Error accessing hashtag posts from Redux state:", error);
      return [];
    }
  });
};

export const useUserPostsSelector = () => {
  return useSelector((state: RootState) => {
    try {
      // Handle cases where state or state.post might be undefined during rehydration
      if (!state || !state.post || !state.post.userPosts) {
        return [];
      }
      return Array.isArray(state.post.userPosts) ? state.post.userPosts : [];
    } catch (error) {
      console.warn("Error accessing user posts from Redux state:", error);
      return [];
    }
  });
};

export const useSavedPostsSelector = () => {
  return useSelector((state: RootState) => {
    try {
      // Handle cases where state or state.post might be undefined during rehydration
      if (!state || !state.post || !state.post.savedPosts) {
        return [];
      }
      return Array.isArray(state.post.savedPosts) ? state.post.savedPosts : [];
    } catch (error) {
      console.warn("Error accessing saved posts from Redux state:", error);
      return [];
    }
  });
};

export const useLikedPostsSelector = () => {
  return useSelector((state: RootState) => {
    try {
      // Handle cases where state or state.post might be undefined during rehydration
      if (!state || !state.post || !state.post.likedPosts) {
        return [];
      }
      return Array.isArray(state.post.likedPosts) ? state.post.likedPosts : [];
    } catch (error) {
      console.warn("Error accessing liked posts from Redux state:", error);
      return [];
    }
  });
};

export const useFollowingPostsSelector = () => {
  return useSelector((state: RootState) => {
    try {
      // Handle cases where state or state.post might be undefined during rehydration
      if (!state || !state.post || !state.post.followingPosts) {
        return [];
      }
      return Array.isArray(state.post.followingPosts)
        ? state.post.followingPosts
        : [];
    } catch (error) {
      console.warn("Error accessing following posts from Redux state:", error);
      return [];
    }
  });
};
