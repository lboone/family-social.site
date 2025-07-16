import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Comment, Post } from "../types";

interface PostState {
  posts: Post[];
  hashtagPosts: Post[];
  userPosts: Post[];
}

const initialState: PostState = {
  posts: [],
  hashtagPosts: [],
  userPosts: [],
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
      const post = state.posts?.find((post) => post._id === postId);
      if (post) {
        if (post.likes.includes(userId)) {
          post.likes = post.likes.filter((like) => like !== userId);
        } else {
          post.likes.push(userId);
        }
      }
    },
    addComment: (
      state,
      action: PayloadAction<{ postId: string; comment: Comment }>
    ) => {
      const { postId, comment } = action.payload;
      const post = state.posts?.find((post) => post._id === postId);
      if (post) {
        post.comments.push(comment);
      }
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
} = postSlice.actions;

export default postSlice.reducer;
