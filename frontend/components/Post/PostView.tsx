"use client";

import UserAvatar from "@/components/Home/UserAvatar";
import { cn } from "@/lib/utils";
import { API_URL_POST } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import { addComment, likeOrDislikePost } from "@/store/postSlice";
import { Comment, Post, User } from "@/types";
import { formatRelativeTime } from "@/utils/functions";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import axios from "axios";
import {
  BookmarkIcon,
  HeartIcon,
  ImageDownIcon,
  ImageUpIcon,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import DotButton from "../Form/DotButton";
import HashtagText from "../Form/HashtagText";
import PageLoader from "../Form/PageLoader";
import SpeechBubble from "../Form/SpeechBubble";
import { Button } from "../ui/button";
import { handleAuthRequest } from "../utils/apiRequests";

interface PostViewProps {
  postId: string;
  user: User | null;
}

const PostView = ({ postId, user }: PostViewProps) => {
  const dispatch = useDispatch();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLikeLoading, setIsLikeLoading] = useState<boolean>(false);
  const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false);
  const [isCommentLoading, setIsCommentLoading] = useState<boolean>(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] =
    useState<boolean>(false);
  const [commentsPage, setCommentsPage] = useState<number>(1);
  const [hasMoreComments, setHasMoreComments] = useState<boolean>(false);
  const [totalComments, setTotalComments] = useState<number>(0);

  // Fetch single post
  const fetchPost = useCallback(async () => {
    try {
      const getPostReq = async () =>
        await axios.get(`${API_URL_POST}/post/${postId}`, {
          withCredentials: true,
        });
      const result = await handleAuthRequest(null, getPostReq, setIsLoading);
      if (result?.data.status === "success") {
        setPost(result.data.data.post);
        // Set initial comments (first 10) - ensure they're sorted newest first
        const allComments = result.data.data.post.comments || [];
        const sortedComments = [...allComments].sort(
          (a: Comment, b: Comment) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const initialComments = sortedComments.slice(0, 10);
        setComments(initialComments);
        setTotalComments(allComments.length);
        setHasMoreComments(allComments.length > 10);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load post");
    }
  }, [postId]);

  // Load more comments
  const loadMoreComments = useCallback(async () => {
    if (!post || !hasMoreComments) return;

    try {
      setIsLoadingMoreComments(true);
      const allComments = post.comments || [];
      // Ensure comments are sorted newest first - create a copy before sorting
      const sortedComments = [...allComments].sort(
        (a: Comment, b: Comment) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const startIndex = commentsPage * 10;
      const newComments = sortedComments.slice(startIndex, startIndex + 10);

      if (newComments.length > 0) {
        setComments((prev) => [...prev, ...newComments]);
        setCommentsPage((prev) => prev + 1);
        setHasMoreComments(startIndex + 10 < sortedComments.length);
      } else {
        setHasMoreComments(false);
      }
    } catch (error) {
      console.error("Error loading more comments:", error);
      toast.error("Failed to load more comments");
    } finally {
      setIsLoadingMoreComments(false);
    }
  }, [post, commentsPage, hasMoreComments]);

  const handleLikeDislike = useCallback(
    async (id: string) => {
      try {
        if (!user?._id || !post) {
          console.warn("Cannot like/dislike: User not authenticated");
          return;
        }

        // Optimistically update the UI first
        const wasLiked = post.likes.includes(user._id);

        setPost((prev) => {
          if (!prev) return prev;
          const updatedPost = { ...prev };
          if (wasLiked) {
            // Remove the like
            updatedPost.likes = updatedPost.likes.filter(
              (like) => like !== user._id
            );
          } else {
            // Add the like
            updatedPost.likes = [...updatedPost.likes, user._id];
          }
          return updatedPost;
        });

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
          // Update Redux store
          dispatch(likeOrDislikePost({ postId: id, userId: user._id }));
          toast.success(result?.data.message);
        } else {
          // Revert the optimistic update if the request failed
          setPost((prev) => {
            if (!prev || !user) return prev;
            const revertedPost = { ...prev };
            if (wasLiked) {
              // Revert: add the like back
              revertedPost.likes = [...revertedPost.likes, user._id];
            } else {
              // Revert: remove the like
              revertedPost.likes = revertedPost.likes.filter(
                (like) => like !== user._id
              );
            }
            return revertedPost;
          });
          toast.error("Failed to update like status");
        }
      } catch (error) {
        console.error("Error in handleLikeDislike:", error);
        // Revert the optimistic update on error
        if (!user || !post) return;

        const wasLiked = post.likes.includes(user._id);
        setPost((prev) => {
          if (!prev || !user) return prev;
          const revertedPost = { ...prev };
          if (!wasLiked) {
            // Revert: add the like back (since we removed it optimistically)
            revertedPost.likes = [...revertedPost.likes, user._id];
          } else {
            // Revert: remove the like (since we added it optimistically)
            revertedPost.likes = revertedPost.likes.filter(
              (like) => like !== user._id
            );
          }
          return revertedPost;
        });
        toast.error("Failed to update like status");
      }
    },
    [dispatch, user, post]
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
        if (!comment || !user) {
          console.warn("Cannot comment: User not authenticated or no comment");
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
          const newComment = result?.data.data.comment;

          // Update local comments state
          setComments((prev) => [newComment, ...prev]);
          setTotalComments((prev) => prev + 1);

          // Update local post state
          setPost((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              comments: [newComment, ...prev.comments],
            };
          });

          // Update Redux store
          dispatch(addComment({ comment: newComment, postId: id }));
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

  const handleDownloadImageToDevice = async () => {
    if (!post?.image || !post?.image.url) return;

    try {
      // Fetch the image as a blob
      const response = await fetch(post.image.url);
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = `${post.image.publicId || "image"}.jpg`; // Set the filename

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);

      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  const handleOpenImageInNewTab = () => {
    if (!post?.image || !post?.image.url) return;
    window.open(post.image.url, "_blank");
  };

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId, fetchPost]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!post) {
    return (
      <div className="mt-20 pl-2 w-full md:w-[70%] md:pl-0 mx-auto flex items-center justify-center">
        <p className="text-gray-500">Post not found</p>
      </div>
    );
  }

  return (
    <div className="mt-20 px-5 w-full md:w-[70%] md:px-0 mx-auto">
      <div className="mt-8 mb-8">
        {/* Post Header */}
        {post.user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserAvatar
                user={post.user}
                avatarImageClassName="h-full w-full"
              />
              <h1 className="font-semibold text-gray-700">
                {post.user?.username}
              </h1>
            </div>
            <DotButton post={post} user={user} />
          </div>
        )}

        {/* Post Image/Content */}
        <div className="mt-2">
          {post.image ? (
            <Image
              src={`${post.image.url}`}
              alt="Post Image"
              width={600}
              height={600}
              className="w-full max-w-2xl mx-auto rounded-lg"
              priority
            />
          ) : (
            <SpeechBubble>
              <HashtagText
                text={post.caption}
                className="text-lg text-center"
              />
            </SpeechBubble>
          )}
        </div>

        {/* Post Actions */}
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
                user?._id && post.likes.includes(user?._id)
                  ? "text-red-600"
                  : ""
              }`}
            />
            <MessageCircle
              className={`cursor-pointer ${
                user?._id &&
                comments.some(
                  (comment) => String(comment.user?._id) === String(user._id)
                )
                  ? "text-red-600"
                  : ""
              }`}
            />

            {post.image && (
              <div className="flex items-center space-x-4 ml-2">
                <div
                  className="flex items-center space-x-1 cursor-pointer text-xs text-gray-500"
                  onClick={handleDownloadImageToDevice}
                >
                  <ImageDownIcon className="cursor-pointer" />
                  <span>Download</span>
                </div>
                <div
                  className="flex items-center space-x-1 cursor-pointer text-xs text-gray-500"
                  onClick={handleOpenImageInNewTab}
                >
                  <ImageUpIcon className="cursor-pointer" />
                  <span>Open in new tab</span>
                </div>
              </div>
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

        {/* Post Stats */}
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-sm font-semibold">{post.likes.length} likes</h1>
          <span className="text-xs text-gray-500">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        {/* Post Caption */}
        {post.image && (
          <HashtagText text={post.caption} className="mt-2 font-medium" />
        )}

        {/* Comments Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">
            Comments ({totalComments})
          </h2>

          {/* Add Comment - Only show if user is authenticated */}
          {user && (
            <div className="mb-6 flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 outline-none border border-gray-300 p-3 rounded-lg"
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    !isCommentLoading &&
                    user &&
                    comment.trim()
                  ) {
                    handleComment(post._id);
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (!isCommentLoading && user && comment.trim()) {
                    handleComment(post._id);
                  }
                }}
                disabled={isCommentLoading || !comment.trim()}
                className={cn(
                  "px-6 py-3",
                  isCommentLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isCommentLoading ? "Posting..." : "Post"}
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment, index) => (
                <div
                  key={comment._id || index}
                  className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg"
                >
                  <Avatar className="flex-shrink-0">
                    <AvatarImage
                      src={comment?.user?.profilePicture}
                      alt={comment?.user?.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <AvatarFallback className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                      {comment?.user?.username
                        ? comment.user.username.charAt(0).toUpperCase() +
                          comment.user.username.charAt(1).toUpperCase()
                        : "UN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-bold">
                        {comment?.user?.username}
                      </p>
                      <span className="text-xs text-gray-500">
                        {comment?.createdAt
                          ? formatRelativeTime(comment.createdAt)
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="text-sm">
                      <HashtagText text={comment?.text} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}

            {/* Load More Comments Button */}
            {hasMoreComments && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMoreComments}
                  disabled={isLoadingMoreComments}
                  className="w-full"
                >
                  {isLoadingMoreComments ? "Loading..." : "Load More Comments"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostView;
