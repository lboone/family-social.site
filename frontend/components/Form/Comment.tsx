"use client";
import { Post, User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { CameraOffIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useDispatch } from "react-redux";
import UserAvatar from "../Home/UserAvatar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import DotButton from "./DotButton";

interface CommentProps {
  user: User | null;
  post: Post | null;
}

const Comment = ({ user, post }: CommentProps) => {
  const [comment, setComment] = useState<string>("");
  const dispatch = useDispatch();

  const addCommentHandler = async (id: string) => {};
  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <p className="mt-2 text-sm font-semibold">
            View All {post?.comments.length} Comments
          </p>
        </DialogTrigger>
        <DialogContent className="max-w-5xl p-0 gap-0 flex flex-col">
          <DialogTitle></DialogTitle>
          <div className="flex flex-1">
            <div className="sm:w-1/2 hidden max-h-[80vh] sm:block">
              {post?.image ? (
                <Image
                  src={`${post?.image?.url}`}
                  alt="Post Image"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover rounded-l-lg"
                />
              ) : (
                <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center rounded-l-lg">
                  <CameraOffIcon className="w-20 h-20 text-gray-400" />
                </div>
              )}
            </div>
            <div className="w-full sm:w-1/2 flex flex-col justify-between">
              <div className="flex items-center justify-between p-4 mt-4">
                <div className="flex gap-3 items-center">
                  <UserAvatar user={user!} />
                  <p className="font-semibold text-sm">{user?.username}</p>
                </div>
                <DotButton post={post!} user={user!} />
              </div>
              <hr />
              <div className="flex-1 overflow-y-auto max-h-96 p-4">
                {post?.comments && post?.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex mb-4 gap-3 items-center"
                    >
                      <Avatar>
                        <AvatarImage
                          src={comment.user.profilePicture}
                          alt={comment.user.username}
                        />
                        <AvatarFallback>
                          {comment.user.username
                            ? comment.user.username.charAt(0).toUpperCase() +
                              comment.user.username.charAt(1).toUpperCase()
                            : "UN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold">
                          {comment.user.username}
                        </p>
                        <p className="font-normal text-sm">{comment.text}</p>
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
                  <Button variant="outline">Send</Button>
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
