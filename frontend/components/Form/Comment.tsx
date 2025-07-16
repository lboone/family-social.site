"use client";
import { API_URL_POST } from "@/server";
import { addComment } from "@/store/postSlice";
import { Post, User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import axios from "axios";
import { CameraOffIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import UserAvatar from "../Home/UserAvatar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { handleAuthRequest } from "../utils/apiRequests";
import DotButton from "./DotButton";
import HashtagText from "./HashtagText";

interface CommentProps {
  user: User | null;
  post: Post | null;
}

const Comment = ({ user, post }: CommentProps) => {
  const [comment, setComment] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  const addCommentHandler = async (id: string) => {
    if (!comment) return;
    const addCommentReq = async () =>
      await axios.post(
        `${API_URL_POST}/comment/${id}`,
        { text: comment },
        { withCredentials: true }
      );
    const result = await handleAuthRequest(null, addCommentReq, setIsLoading);
    if (result?.data.status === "success") {
      dispatch(addComment({ comment: result?.data.data.comment, postId: id }));
      toast.success("Comment posted");
      setComment("");
    }
  };
  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <p className="mt-2 text-sm font-semibold">
            View All {post?.comments.length} Comments
          </p>
        </DialogTrigger>
        <DialogContent className="max-w-6xl min-w-[90vw] sm:min-w-[80vw] lg:min-w-[70vw] xl:min-w-[60vw] min-h-[80vh] p-0 gap-0 flex flex-col">
          <DialogTitle></DialogTitle>
          <div className="flex flex-1 h-full">
            <div className="sm:w-1/2 hidden min-h-[70vh] sm:block">
              {post?.image ? (
                <Image
                  src={`${post?.image?.url}`}
                  alt="Post Image"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover rounded-l-lg"
                />
              ) : (
                <div className="w-full h-full min-h-[70vh] bg-gray-200 flex items-center justify-center rounded-l-lg">
                  <CameraOffIcon className="w-20 h-20 text-gray-400" />
                </div>
              )}
            </div>
            <div className="w-full sm:w-1/2 flex flex-col justify-between min-h-[70vh]">
              <div>
                <div className="flex items-center justify-between px-4 mt-8 mb-4">
                  <div className="flex gap-3 items-center">
                    <UserAvatar
                      user={user!}
                      avatarImageClassName="w-12 h-12 rounded-full object-cover"
                      avatarClassName="w-12 h-12"
                    />
                    <p className="font-semibold text-sm">{user?.username}</p>
                  </div>
                  <DotButton post={post!} user={user!} />
                </div>
                <hr />
              </div>
              <div className="flex-1 overflow-y-auto max-h-[50vh] px-4">
                {post?.comments && post?.comments.length > 0 ? (
                  post.comments.map((comment, index) => (
                    <div
                      key={comment._id || index}
                      className="flex mb-4 gap-3 items-center"
                    >
                      <Avatar>
                        <AvatarImage
                          src={comment?.user?.profilePicture}
                          alt={comment?.user?.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <AvatarFallback>
                          {comment?.user?.username
                            ? comment.user.username.charAt(0).toUpperCase() +
                              comment.user.username.charAt(1).toUpperCase()
                            : "UN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold">
                          {comment?.user?.username}
                        </p>
                        <div className="font-normal text-sm">
                          <HashtagText text={comment?.text} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No comments yet</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full outline-none border text-sm border-gray-300 p-2 rounded"
                  />

                  <Button
                    variant="outline"
                    onClick={() => {
                      if (post?._id) {
                        addCommentHandler(post._id);
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default Comment;
