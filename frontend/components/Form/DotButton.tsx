"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Post, User } from "@/types";
import { EllipsisIcon } from "lucide-react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { Button } from "../ui/button";

interface DotButtonProps {
  post?: Post | null; // Replace with actual post type
  user?: User | null; // Replace with actual user type
}
const DotButton = ({ post, user }: DotButtonProps) => {
  const isOwnPost = post && user ? post?.user?._id === user?._id : false;
  const isFollowing = post?.user?._id
    ? user?.following?.includes(post?.user?._id)
    : false;
  const dispatch = useDispatch();

  const handleDeletePost = async () => {};

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
              >
                {isFollowing ? "Unfollow" : "Follow"}
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
            {isOwnPost && (
              <Button
                className="w-full cursor-pointer"
                variant="destructive"
                onClick={handleDeletePost}
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
