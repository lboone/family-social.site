"use client";

import useGetUser from "@/hooks/useGetUser";
import { API_URL_POST } from "@/server";
import { setPosts } from "@/store/postSlice";
import { RootState } from "@/store/store";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageLoader from "../Form/PageLoader";
import PostItem from "../Form/PostItem";
import { handleAuthRequest } from "../utils/apiRequests";

const Feed = () => {
  const dispatch = useDispatch();
  const { user } = useGetUser();
  const posts = useSelector((state: RootState) => state.post.posts);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getAllPost = async () => {
      const getAllPostReq = async () =>
        await axios.get(`${API_URL_POST}/all`, { withCredentials: true });
      const result = await handleAuthRequest(null, getAllPostReq, setIsLoading);
      if (result) {
        dispatch(setPosts(result.data.data.posts));
      }
    };
    getAllPost();
  }, [dispatch]);

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
    <div className="mt-20 pl-2 w-full md:w-[70%] md:p1-0 mx-auto">
      {posts.map((post) => (
        <PostItem
          post={post}
          user={user}
          setIsLoading={setIsLoading}
          key={post._id}
        />
      ))}
    </div>
  );
};
export default Feed;
