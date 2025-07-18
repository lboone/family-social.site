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
      {/* Image/Content Container */}
      <div className="relative">
        {post?.image ? (
          <Link
            href={`/post/${post._id}`}
            className="[@media(hover:hover)]:hidden flex items-center justify-between p-3 bg-white cursor-pointer"
          >
            <Image
              src={`${post?.image?.url}`}
              alt="Post"
              width={300}
              height={300}
              className="w-full h-full object-cover aspect-square"
              priority
            />
          </Link>
        ) : (
          <div className="h-full w-full px-6 py-10 bg-gray-200/75 flex items-center justify-center aspect-square">
            <HashtagText
              text={post.caption}
              className="text-center text-lg line-clamp-none sm:line-clamp-5 xl:line-clamp-none"
            />
          </div>
        )}

        {/* Desktop/Mouse Hover effect - Only on devices that can hover */}
        <div className="hover:flex absolute inset-0 bg-black items-center justify-center opacity-0 group-hover:opacity-75 transition-opacity duration-300 [@media(hover:none)]:hidden">
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

      {/* Touch Device Stats - Always visible on touch devices, hidden on hover-capable devices */}
      <div className="[@media(hover:hover)]:hidden flex items-center justify-between p-3 bg-white">
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1 text-gray-700">
            <HeartIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{post?.likes.length}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-700">
            <MessageCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{post?.comments.length}</span>
          </div>
        </div>
        <Link href={`/post/${post._id}`} className="cursor-pointer">
          <LinkIcon className="w-5 h-5 text-gray-700" />
        </Link>
      </div>
    </div>
  );
};
export default PostItemShort;
