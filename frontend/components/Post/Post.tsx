"use client";
import useGetUser from "@/hooks/useGetUser";
import PageLoader from "../Form/PageLoader";
import LeftSidebar from "../Home/LeftSidebar";
import RightSidebar from "../Home/RightSidebar";
import SidebarMobile from "../Home/SidebarMobile";
import PostView from "./PostView";

interface PostProps {
  id: string;
}
const Post = ({ id }: PostProps) => {
  const { user } = useGetUser();

  if (!user) {
    return <PageLoader />;
  }

  return (
    <div className="flex">
      <div className="hidden md:block border-r-2 h-screen fixed w-[20%]">
        <LeftSidebar />
      </div>
      <div className="flex-1 md:ml-[20%] overflow-y-auto">
        <SidebarMobile />
        <PostView postId={id} user={user} />
      </div>
      <div className="w-[30%] pt-8 px-6 lg:block hidden">
        <RightSidebar />
      </div>
    </div>
  );
};
export default Post;
