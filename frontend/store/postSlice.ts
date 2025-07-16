import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Comment, Post } from "../types";

interface PostState {
  posts: Post[];
  hashtagPosts: Post[];
  userPosts: Post[];
  savedPosts: Post[];
  likedPosts: Post[];
}

const initialState: PostState = {
  posts: [],
  hashtagPosts: [],
  userPosts: [],
  savedPosts: [],
  likedPosts: [],
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
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
    },
    appendPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = [...(state.posts || []), ...action.payload];
    },
    setHashtagPosts: (state, action: PayloadAction<Post[]>) => {
      state.hashtagPosts = action.payload;
    },
    appendHashtagPosts: (state, action: PayloadAction<Post[]>) => {
      state.hashtagPosts = [...(state.hashtagPosts || []), ...action.payload];
    },
    setUserPosts: (state, action: PayloadAction<Post[]>) => {
      state.userPosts = action.payload;
    },
    appendUserPosts: (state, action: PayloadAction<Post[]>) => {
      state.userPosts = [...(state.userPosts || []), ...action.payload];
    },
    setSavedPosts: (state, action: PayloadAction<Post[]>) => {
      state.savedPosts = action.payload;
    },
    appendSavedPosts: (state, action: PayloadAction<Post[]>) => {
      state.savedPosts = [...(state.savedPosts || []), ...action.payload];
    },
    setLikedPosts: (state, action: PayloadAction<Post[]>) => {
      state.likedPosts = action.payload;
    },
    appendLikedPosts: (state, action: PayloadAction<Post[]>) => {
      state.likedPosts = [...(state.likedPosts || []), ...action.payload];
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
} = postSlice.actions;

export default postSlice.reducer;
