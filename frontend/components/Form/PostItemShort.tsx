import { Post } from "@/types";
import { HeartIcon, LinkIcon, MessageCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import HashtagText from "./HashtagText";

interface PostItemShortProps {
  post: Post;
}
const PostItemShort = ({ post }: PostItemShortProps) => {
  return (
    <div className="relative group overflow-hidden">
      {post?.image ? (
        <Image
          src={`${post?.image?.url}`}
          alt="Post"
          width={300}
          height={300}
          className="w-full h-full object-cover aspect-square"
        />
      ) : (
        <div className="h-96 w-full px-6 py-10 bg-gray-200/75 flex items-center justify-center">
          <HashtagText text={post.caption} className="text-center text-lg" />
        </div>
      )}

      <div className="absolute inset-0 bg-black flex items-center justify-center opacity-0 group-hover:opacity-75 transition-opacity duration-300">
        <div className="flex space-x-6">
          <button className="p-2 rounded-full text-white space-x-2 flex items-center font-bold">
            <HeartIcon className="w-7 h-7" />
            <span>{post?.likes.length}</span>
          </button>
          <button className="p-2 rounded-full text-white space-x-2 flex items-center font-bold">
            <MessageCircleIcon className="w-7 h-7" />
            <span>{post?.comments.length}</span>
          </button>
          <Link href={`/post/${post._id}`} className="cursor-pointer">
            <button className="p-2 rounded-full text-white space-x-2 flex items-center font-bold">
              <LinkIcon className="w-7 h-7" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default PostItemShort;
