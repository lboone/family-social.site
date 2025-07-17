"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFollowUnfollow } from "@/hooks/useAuth";
import useGetUser from "@/hooks/useGetUser";
import { API_URL_POST } from "@/server";
import { deletePost } from "@/store/postSlice";
import { Post, User } from "@/types";
import axios from "axios";
import { EllipsisIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { handleAuthRequest } from "../utils/apiRequests";

interface DotButtonProps {
  post?: Post | null; // Replace with actual post type
  user?: User | null; // Replace with actual user type
}
const DotButton = ({ post, user }: DotButtonProps) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { handleFollowUnfollow } = useFollowUnfollow({
    setLoading: setIsLoading,
  });
  const { isAdmin } = useGetUser();
  const isOwnPost = post && user ? post?.user?._id === user?._id : false;
  // const isFollowing = post?.user?._id
  //   ? user?.following?.includes(post?.user?._id)
  //   : false;

  const isFollowing = post?.user?._id
    ? user?.following?.some(
        (followId) => String(followId) === String(post?.user?._id)
      )
    : false;

  const handleDeletePost = async () => {
    const deletePostReq = async () =>
      await axios.delete(`${API_URL_POST}/delete/${post?._id}`, {
        withCredentials: true,
      });
    const result = await handleAuthRequest(null, deletePostReq, setIsLoading);
    if (result?.data.status === "success") {
      if (post?._id) {
        dispatch(deletePost(post._id));
        toast.success(result?.data.message);
      }
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <EllipsisIcon className="w-8 h-8 text-black" />
        </DialogTrigger>
        <DialogContent>
          <DialogTitle></DialogTitle>
          <div className="space-y-4 flex flex-col w-full justify-center items-center mx-auto">
            {!isOwnPost && (
              <Button
                className="w-full cursor-pointer"
                variant={isFollowing ? "destructive" : "secondary"}
                onClick={() => handleFollowUnfollow(post?.user?._id as string)}
                disabled={isLoading}
              >
                {isLoading
                  ? "Updating..."
                  : isFollowing
                  ? "Unfollow"
                  : "Follow"}
              </Button>
            )}
            <Link
              href={`/profile/${post?.user?._id}`}
              className="w-full cursor-pointer"
            >
              <Button variant="secondary" className="w-full">
                About This Account
              </Button>
            </Link>
            {(isOwnPost || isAdmin) && (
              <Button
                className="w-full cursor-pointer"
                variant="destructive"
                onClick={() => handleDeletePost()}
              >
                Delete Post
              </Button>
            )}
            <DialogClose className="w-full border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-md p-2">
              Cancel
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default DotButton;
