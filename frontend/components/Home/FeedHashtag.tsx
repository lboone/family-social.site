"use client";

import PageLoader from "@/components/Form/PageLoader";
import { handleAuthRequest } from "@/components/utils/apiRequests";
import useGetUser from "@/hooks/useGetUser";
import { API_URL_POST } from "@/server";
import { setPosts } from "@/store/postSlice";
import { RootState } from "@/store/store";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PostItem from "../Form/PostItem";

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
          <PostItem key={post._id} post={post} user={user} showOwner={true} />
        ))}
      </div>
    </div>
  );
}
