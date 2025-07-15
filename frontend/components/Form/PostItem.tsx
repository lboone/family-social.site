"use client";

import UserAvatar from "@/components/Home/UserAvatar";
import { cn } from "@/lib/utils";
import { API_URL_POST } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import { likeOrDislikePost } from "@/store/postSlice";
import { Post, User } from "@/types";
import axios from "axios";
import { BookmarkIcon, HeartIcon, MessageCircle, SendIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import Comment from "../Form/Comment";
import DotButton from "../Form/DotButton";
import HashtagText from "../Form/HashtagText";
import { handleAuthRequest } from "../utils/apiRequests";

interface PostItemProps {
  post: Post;
  setIsLoading?: (loading: boolean) => void;
  user: User | null;
  postClassName?: string;
  showOwner?: boolean;
  imageWidth?: number;
  imageHeight?: number;
  imageClassName?: string;
}
const PostItem = ({
  post,
  setIsLoading,
  user,
  postClassName,
  showOwner = true,
  imageWidth,
  imageHeight,
  imageClassName,
}: PostItemProps) => {
  const dispatch = useDispatch();
  const [comment, setComment] = useState<string>("");

  const handleLikeDislike = async (id: string) => {
    const likeDislikeReq = async () =>
      await axios.post(`${API_URL_POST}/like-unlike/${id}`, null, {
        withCredentials: true,
      });
    const result = await handleAuthRequest(null, likeDislikeReq, setIsLoading);
    if (result?.data.status === "success") {
      dispatch(likeOrDislikePost({ postId: id, userId: user!._id }));
      toast.success(result?.data.message);
    }
  };
  const handleSaveUnsave = async (id: string) => {
    const saveUnsaveReq = async () =>
      await axios.post(`${API_URL_POST}/save-unsave/${id}`, null, {
        withCredentials: true,
      });
    const result = await handleAuthRequest(null, saveUnsaveReq, setIsLoading);
    if (result?.data.status === "success") {
      dispatch(setAuthUser(result?.data.data.user));
      toast.success(result?.data.message);
    }
  };
  const handleComment = async (id: string) => {};
  return (
    <div key={post._id} className={cn("mt-8", postClassName)}>
      {showOwner && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserAvatar
              user={post.user!}
              avatarImageClassName="h-full w-full"
            />
            <h1 className="font-semibold text-gray-700">
              {post.user?.username}
            </h1>
          </div>
          <DotButton post={post} user={user} />
        </div>
      )}
      <div className="mt-2">
        {post.image ? (
          <Image
            src={`${post.image.url}`}
            alt="Post Image"
            width={imageWidth || 400}
            height={imageHeight || 400}
            className={cn("w-full", imageClassName)}
          />
        ) : (
          <div className="h-96 w-full px-6 py-10 bg-gray-200/75 flex items-center justify-center">
            {/* {post.caption} */}
            <HashtagText text={post.caption} className="text-center text-lg" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <HeartIcon
            onClick={() => handleLikeDislike(post._id)}
            className={`cursor-pointer ${
              user?._id && post.likes.includes(user?._id) ? "text-red-600" : ""
            }`}
          />
          <MessageCircle
            onClick={() => handleComment(post._id)}
            className="cursor-pointer"
          />
          <SendIcon
            onClick={() => handleSaveUnsave(post._id)}
            className="cursor-pointer"
          />
        </div>
        <BookmarkIcon
          onClick={() => handleSaveUnsave(post._id)}
          className={`cursor-pointer ${
            (user?.savedPosts as string[])?.some(
              (savedPostId: string) => savedPostId === post._id
            )
              ? "text-red-500"
              : ""
          }`}
        />
      </div>
      <h1 className="mt-2 text-sm font-semibold">{post.likes.length} likes</h1>
      {/* {post.image && <p className="mt-2 font-medium">{post.caption}</p>} */}
      {post.image && (
        <HashtagText text={post.caption} className="mt-2 font-medium" />
      )}
      <Comment user={post.user!} post={post} />
      <div className="mt-2 flex items-center">
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 placeholder:text-gray-800 outline-none"
        />
        <p
          role="button"
          className="text-sm font-semibold text-sky-700 cursor-pointer"
          onClick={() => {
            handleComment(post._id);
          }}
        >
          Post
        </p>
      </div>
      <div className="pb-6 border-b-2"></div>
    </div>
  );
};

export default PostItem;
