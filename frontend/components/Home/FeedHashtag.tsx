"use client";

import Comment from "@/components/Form/Comment";
import DotButton from "@/components/Form/DotButton";
import HashtagText from "@/components/Form/HashtagText";
import PageLoader from "@/components/Form/PageLoader";
import UserAvatar from "@/components/Home/UserAvatar";
import { handleAuthRequest } from "@/components/utils/apiRequests";
import useGetUser from "@/hooks/useGetUser";
import { API_URL_POST } from "@/server";
import { setPosts } from "@/store/postSlice";
import { RootState } from "@/store/store";
import axios from "axios";
import { BookmarkIcon, HeartIcon, MessageCircle, SendIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// This would be your hashtag search/feed page
interface FeedHashtagProps {
  hashtag: string;
}

export default function FeedHashtag({ hashtag }: FeedHashtagProps) {
  const dispatch = useDispatch();
  const { user } = useGetUser();
  const posts = useSelector((state: RootState) => state.post.posts);
  const [comment, setComment] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getAllPost = async () => {
      const getAllPostReq = async () =>
        await axios.get(`${API_URL_POST}/by-hashtag/${hashtag}`, {
          withCredentials: true,
        });
      const result = await handleAuthRequest(null, getAllPostReq, setIsLoading);
      if (result) {
        dispatch(setPosts(result.data.data.posts));
      }
    };
    getAllPost();
  }, [hashtag, dispatch]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLikeDislike = async (id: string) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveUnsave = async (id: string) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleComment = async (id: string) => {};

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <PageLoader />
      </div>
    );
  }

  if (posts.length < 1) {
    return (
      <div className="flex flex-col w-full h-screen items-center ">
        <div className="flex flex-col gap-10 mt-20">
          <h1 className="text-3xl font-bold text-center">No Posts Yet</h1>
          <p className="text-lg text-gray-600 text-center mb-10">
            Be the first to post something great!
          </p>
          <Image
            src="/images/no-posts-yet.png"
            alt="No Posts Yet"
            width={980}
            height={980}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col mt-10 md:mt-20 px-2 w-full md:w-[70%] md:px-0 mx-auto">
      <h1 className="text-2xl font-bold mb-2">
        Posts for <span className="text-sky-600">#{hashtag}</span>
      </h1>
      <div className="">
        {posts.map((post) => (
          <div key={post._id} className="mt-8">
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
            <div className="mt-2">
              {post.image ? (
                <Image
                  src={`${post.image.url}`}
                  alt="Post Image"
                  width={400}
                  height={400}
                  className="w-full"
                />
              ) : (
                <div className="h-96 w-full px-6 py-10 bg-gray-200/75 flex items-center justify-center">
                  {/* {post.caption} */}
                  <HashtagText
                    text={post.caption}
                    className="text-center text-lg"
                  />
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <HeartIcon
                  onClick={() => handleLikeDislike(post._id)}
                  className="cursor-pointer"
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
                className="cursor-pointer"
              />
            </div>
            <h1 className="mt-2 text-sm font-semibold">
              {post.likes.length} likes
            </h1>
            {/* {post.image && <p className="mt-2 font-medium">{post.caption}</p>} */}
            {post.image && (
              <HashtagText text={post.caption} className="mt-2 font-medium" />
            )}
            <Comment user={user} post={post} />
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
        ))}
      </div>
    </div>
  );
}
