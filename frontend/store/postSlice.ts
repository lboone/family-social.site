import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Comment, Post } from "../types";

interface PostState {
  posts: Post[];
}

const initialState: PostState = {
  posts: [],
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
      const post = state.posts.find((post) => post._id === postId);
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
      const post = state.posts.find((post) => post._id === postId);
      if (post) {
        post.comments.push(comment);
      }
    },
  },
});

export const { setPosts, addPost, deletePost, likeOrDislikePost, addComment } =
  postSlice.actions;

export default postSlice.reducer;
