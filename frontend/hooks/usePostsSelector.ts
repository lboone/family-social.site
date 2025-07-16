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
