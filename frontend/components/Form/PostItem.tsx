"use client";

import UserAvatar from "@/components/Home/UserAvatar";
import { cn } from "@/lib/utils";
import { API_URL_POST } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import { addComment, likeOrDislikePost } from "@/store/postSlice";
import { Post, User } from "@/types";
import { formatRelativeTime } from "@/utils/functions"; // Adjust the import path as necessary
import axios from "axios";
import { BookmarkIcon, HeartIcon, LinkIcon, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import Comment from "../Form/Comment";
import DotButton from "../Form/DotButton";
import HashtagText from "../Form/HashtagText";
import SpeechBubble from "../Form/SpeechBubble";
import { handleAuthRequest } from "../utils/apiRequests";

// Utility function to format relative time

interface PostItemProps {
  post: Post;
  setIsLoading?: (loading: boolean) => void;
  user: User | null;
  postClassName?: string;
  showOwner?: boolean;
  imageWidth?: number;
  imageHeight?: number;
  imageClassName?: string;
  showLink?: boolean;
}
const PostItem = ({
  post,
  user,
  postClassName,
  showOwner = true,
  imageWidth,
  imageHeight,
  imageClassName,
  showLink = true,
}: PostItemProps) => {
  const dispatch = useDispatch();
  const [comment, setComment] = useState<string>("");
  const [isLikeLoading, setIsLikeLoading] = useState<boolean>(false);
  const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false);
  const [isCommentLoading, setIsCommentLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLikeDislike = useCallback(
    async (id: string) => {
      try {
        if (!user?._id) {
          console.warn("Cannot like/dislike: User not authenticated");
          return;
        }

        const likeDislikeReq = async () =>
          await axios.post(`${API_URL_POST}/like-unlike/${id}`, null, {
            withCredentials: true,
          });
        const result = await handleAuthRequest(
          null,
          likeDislikeReq,
          setIsLikeLoading
        );
        if (result?.data.status === "success") {
          dispatch(likeOrDislikePost({ postId: id, userId: user._id }));
          toast.success(result?.data.message);
        }
      } catch (error) {
        console.error("Error in handleLikeDislike:", error);
        toast.error("Failed to update like status");
      }
    },
    [dispatch, user]
  );

  const handleSaveUnsave = useCallback(
    async (id: string) => {
      try {
        if (!user) {
          console.warn("Cannot save/unsave: User not authenticated");
          return;
        }

        const saveUnsaveReq = async () =>
          await axios.post(`${API_URL_POST}/save-unsave/${id}`, null, {
            withCredentials: true,
          });
        const result = await handleAuthRequest(
          null,
          saveUnsaveReq,
          setIsSaveLoading
        );
        if (result?.data.status === "success") {
          dispatch(setAuthUser(result?.data.data.user));
          toast.success(result?.data.message);
        }
      } catch (error) {
        console.error("Error in handleSaveUnsave:", error);
        toast.error("Failed to update save status");
      }
    },
    [dispatch, user]
  );

  const handleComment = useCallback(
    async (id: string) => {
      try {
        if (!comment) return;
        if (!user) {
          console.warn("Cannot comment: User not authenticated");
          return;
        }

        const addCommentReq = async () =>
          await axios.post(
            `${API_URL_POST}/comment/${id}`,
            { text: comment },
            { withCredentials: true }
          );
        const result = await handleAuthRequest(
          null,
          addCommentReq,
          setIsCommentLoading
        );
        if (result?.data.status === "success") {
          dispatch(
            addComment({ comment: result?.data.data.comment, postId: id })
          );
          toast.success("Comment posted");
          setComment("");
        }
      } catch (error) {
        console.error("Error in handleComment:", error);
        toast.error("Failed to post comment");
      }
    },
    [comment, dispatch, user]
  );

  // Early return if post is invalid
  if (!post || !post._id) {
    console.warn("PostItem: Invalid post data", { post });
    return null;
  }

  console.log({ user, post });
  return (
    <div key={post._id} className={cn("mt-8", postClassName)}>
      {showOwner && post.user && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserAvatar user={post.user} avatarImageClassName="h-full w-full" />
            <h1 className="font-semibold text-gray-700">
              {post.user?.username}
            </h1>
          </div>
          <DotButton post={post} user={user} />
        </div>
      )}
      <div className="mt-2">
        {post.image ? (
          showLink ? (
            <Link href={`/post/${post._id}`}>
              <Image
                src={`${post.image.url}`}
                alt="Post Image"
                width={imageWidth || 400}
                height={imageHeight || 400}
                className={cn("w-full", imageClassName)}
                priority
              />
            </Link>
          ) : (
            <Image
              src={`${post.image.url}`}
              alt="Post Image"
              width={imageWidth || 400}
              height={imageHeight || 400}
              className={cn("w-full", imageClassName)}
              priority
            />
          )
        ) : (
          <SpeechBubble>
            <HashtagText
              text={post.caption}
              className="text-center text-lg leading-relaxed"
            />
          </SpeechBubble>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <HeartIcon
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isLikeLoading && user) {
                handleLikeDislike(post._id);
              }
            }}
            className={`cursor-pointer transition-colors ${
              isLikeLoading ? "opacity-50 cursor-not-allowed" : ""
            } ${
              user?._id && post.likes.includes(user?._id) ? "text-red-600" : ""
            }`}
          />
          <MessageCircle
            className={`cursor-pointer ${
              user?._id &&
              post.comments.some(
                (comment) => String(comment.user?._id) === String(user._id)
              )
                ? "text-red-600"
                : ""
            }`}
          />
          {!post.image && (
            <LinkIcon
              className="cursor-pointer"
              onClick={() => {
                router.push(`/post/${post._id}`);
              }}
            />
          )}
        </div>
        <BookmarkIcon
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isSaveLoading && user) {
              handleSaveUnsave(post._id);
            }
          }}
          className={`cursor-pointer transition-colors ${
            isSaveLoading ? "opacity-50 cursor-not-allowed" : ""
          } ${
            (user?.savedPosts as string[])?.some(
              (savedPostId: string) => savedPostId === post._id
            )
              ? "text-red-500"
              : ""
          }`}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-sm font-semibold">{post.likes.length} likes</h1>
        <span className="text-xs text-gray-500">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>
      {/* {post.image && <p className="mt-2 font-medium">{post.caption}</p>} */}
      {post.image && (
        <HashtagText text={post.caption} className="mt-2 font-medium" />
      )}
      {post.user && <Comment user={post.user} post={post} />}
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
          className={`text-sm font-semibold cursor-pointer transition-colors ${
            isCommentLoading
              ? "opacity-50 cursor-not-allowed text-gray-400"
              : "text-sky-700"
          }`}
          onClick={() => {
            if (!isCommentLoading && user) {
              handleComment(post._id);
            }
          }}
        >
          {isCommentLoading ? "Posting..." : "Post"}
        </p>
      </div>
      <div className="pb-6 border-b-2"></div>
    </div>
  );
};

// Custom comparison function for memo to prevent unnecessary re-renders
const areEqual = (prevProps: PostItemProps, nextProps: PostItemProps) => {
  // Early return if either post is null/undefined
  if (!prevProps.post || !nextProps.post) {
    return prevProps.post === nextProps.post;
  }

  // Compare basic props (ignore setIsLoading as it's a function that changes on every render)
  if (
    prevProps.postClassName !== nextProps.postClassName ||
    prevProps.showOwner !== nextProps.showOwner ||
    prevProps.imageWidth !== nextProps.imageWidth ||
    prevProps.imageHeight !== nextProps.imageHeight ||
    prevProps.imageClassName !== nextProps.imageClassName
  ) {
    return false;
  }

  // Compare user
  if (prevProps.user?._id !== nextProps.user?._id) {
    return false;
  }

  // Compare post - check the fields that matter for rendering
  if (
    prevProps.post._id !== nextProps.post._id ||
    prevProps.post.caption !== nextProps.post.caption ||
    prevProps.post.image?.url !== nextProps.post.image?.url ||
    prevProps.post.likes.length !== nextProps.post.likes.length ||
    prevProps.post.comments.length !== nextProps.post.comments.length
  ) {
    return false;
  }

  // Check if current user's like status changed
  const prevLiked = prevProps.user?._id
    ? prevProps.post.likes.includes(prevProps.user._id)
    : false;
  const nextLiked = nextProps.user?._id
    ? nextProps.post.likes.includes(nextProps.user._id)
    : false;
  if (prevLiked !== nextLiked) {
    return false;
  }

  // Check if current user's save status changed
  const prevSavedPosts = prevProps.user?.savedPosts || [];
  const nextSavedPosts = nextProps.user?.savedPosts || [];

  const prevSaved = Array.isArray(prevSavedPosts)
    ? prevSavedPosts.some((savedPost) =>
        typeof savedPost === "string"
          ? savedPost === prevProps.post._id
          : savedPost?._id === prevProps.post._id
      )
    : false;

  const nextSaved = Array.isArray(nextSavedPosts)
    ? nextSavedPosts.some((savedPost) =>
        typeof savedPost === "string"
          ? savedPost === nextProps.post._id
          : savedPost?._id === nextProps.post._id
      )
    : false;

  if (prevSaved !== nextSaved) {
    return false;
  }

  // NOTE: We intentionally ignore setIsLoading function comparison
  // as it's recreated on every parent render but doesn't affect the component's output

  return true;
};

export default memo(PostItem, areEqual);
