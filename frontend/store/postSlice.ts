import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Comment, Post } from "../types";

interface PostState {
  posts: Post[];
  hashtagPosts: Post[];
  userPosts: Post[];
  savedPosts: Post[];
  likedPosts: Post[];
  followingPosts: Post[];
}

const initialState: PostState = {
  posts: [],
  hashtagPosts: [],
  userPosts: [],
  savedPosts: [],
  likedPosts: [],
  followingPosts: [],
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      // Deduplicate posts based on _id
      const uniquePosts = action.payload.filter(
        (post, index, self) =>
          index === self.findIndex((p) => p._id === post._id)
      );
      state.posts = uniquePosts;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
    },
    likeOrDislikePost: (
      state,
      action: PayloadAction<{ postId: string; userId: string }>
    ) => {
      const { postId, userId } = action.payload;

      // Helper function to update likes in a post
      const updatePostLikes = (post: Post) => {
        if (post.likes.includes(userId)) {
          post.likes = post.likes.filter((like) => like !== userId);
        } else {
          post.likes.push(userId);
        }
      };

      // Update the post in all arrays where it might exist
      const updatePostInArray = (posts: Post[]) => {
        const post = posts?.find((post) => post._id === postId);
        if (post) {
          updatePostLikes(post);
        }
      };

      updatePostInArray(state.posts);
      updatePostInArray(state.hashtagPosts);
      updatePostInArray(state.userPosts);
      updatePostInArray(state.savedPosts);
      updatePostInArray(state.likedPosts);
      updatePostInArray(state.followingPosts);
    },
    addComment: (
      state,
      action: PayloadAction<{ postId: string; comment: Comment }>
    ) => {
      const { postId, comment } = action.payload;

      // Update the post in all arrays where it might exist
      const updatePostInArray = (posts: Post[]) => {
        const post = posts?.find((post) => post._id === postId);
        if (post) {
          post.comments.push(comment);
        }
      };

      updatePostInArray(state.posts);
      updatePostInArray(state.hashtagPosts);
      updatePostInArray(state.userPosts);
      updatePostInArray(state.savedPosts);
      updatePostInArray(state.likedPosts);
      updatePostInArray(state.followingPosts);
    },
    appendPosts: (state, action: PayloadAction<Post[]>) => {
      const existingIds = new Set((state.posts || []).map((post) => post._id));
      const newPosts = action.payload.filter(
        (post) => !existingIds.has(post._id)
      );
      state.posts = [...(state.posts || []), ...newPosts];
    },
    setHashtagPosts: (state, action: PayloadAction<Post[]>) => {
      // Deduplicate posts based on _id
      const uniquePosts = action.payload.filter(
        (post, index, self) =>
          index === self.findIndex((p) => p._id === post._id)
      );
      state.hashtagPosts = uniquePosts;
    },
    appendHashtagPosts: (state, action: PayloadAction<Post[]>) => {
      const existingIds = new Set(
        (state.hashtagPosts || []).map((post) => post._id)
      );
      const newPosts = action.payload.filter(
        (post) => !existingIds.has(post._id)
      );
      state.hashtagPosts = [...(state.hashtagPosts || []), ...newPosts];
    },
    setUserPosts: (state, action: PayloadAction<Post[]>) => {
      // Deduplicate posts based on _id
      const uniquePosts = action.payload.filter(
        (post, index, self) =>
          index === self.findIndex((p) => p._id === post._id)
      );
      state.userPosts = uniquePosts;
    },
    appendUserPosts: (state, action: PayloadAction<Post[]>) => {
      const existingIds = new Set(
        (state.userPosts || []).map((post) => post._id)
      );
      const newPosts = action.payload.filter(
        (post) => !existingIds.has(post._id)
      );
      state.userPosts = [...(state.userPosts || []), ...newPosts];
    },
    setSavedPosts: (state, action: PayloadAction<Post[]>) => {
      // Deduplicate posts based on _id
      const uniquePosts = action.payload.filter(
        (post, index, self) =>
          index === self.findIndex((p) => p._id === post._id)
      );
      state.savedPosts = uniquePosts;
    },
    appendSavedPosts: (state, action: PayloadAction<Post[]>) => {
      const existingIds = new Set(
        (state.savedPosts || []).map((post) => post._id)
      );
      const newPosts = action.payload.filter(
        (post) => !existingIds.has(post._id)
      );
      state.savedPosts = [...(state.savedPosts || []), ...newPosts];
    },
    setLikedPosts: (state, action: PayloadAction<Post[]>) => {
      // Deduplicate posts based on _id
      const uniquePosts = action.payload.filter(
        (post, index, self) =>
          index === self.findIndex((p) => p._id === post._id)
      );
      state.likedPosts = uniquePosts;
    },
    appendLikedPosts: (state, action: PayloadAction<Post[]>) => {
      const existingIds = new Set(
        (state.likedPosts || []).map((post) => post._id)
      );
      const newPosts = action.payload.filter(
        (post) => !existingIds.has(post._id)
      );
      state.likedPosts = [...(state.likedPosts || []), ...newPosts];
    },
    setFollowingPosts: (state, action: PayloadAction<Post[]>) => {
      // Deduplicate posts based on _id
      const uniquePosts = action.payload.filter(
        (post, index, self) =>
          index === self.findIndex((p) => p._id === post._id)
      );
      state.followingPosts = uniquePosts;
    },
    appendFollowingPosts: (state, action: PayloadAction<Post[]>) => {
      const existingIds = new Set(
        (state.followingPosts || []).map((post) => post._id)
      );
      const newPosts = action.payload.filter(
        (post) => !existingIds.has(post._id)
      );
      state.followingPosts = [...(state.followingPosts || []), ...newPosts];
    },
  },
});

export const {
  setPosts,
  addPost,
  deletePost,
  likeOrDislikePost,
  addComment,
  appendPosts,
  setHashtagPosts,
  appendHashtagPosts,
  setUserPosts,
  appendUserPosts,
  setSavedPosts,
  appendSavedPosts,
  setLikedPosts,
  appendLikedPosts,
  setFollowingPosts,
  appendFollowingPosts,
} = postSlice.actions;

export default postSlice.reducer;
