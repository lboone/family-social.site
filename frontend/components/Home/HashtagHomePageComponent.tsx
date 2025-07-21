"use client";
import FeedHashtags from "./FeedHashtags";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import SidebarMobile from "./SidebarMobile";

const HashtagHomePageComponent = () => {
  return (
    <div className="flex">
      <div className="hidden md:block border-r-2 h-screen fixed w-[20%]">
        <LeftSidebar />
      </div>
      <div className="flex-1 md:ml-[20%] overflow-y-auto">
        <SidebarMobile />
        <FeedHashtags />
      </div>
      <div className="w-[30%] pt-8 px-6 lg:block hidden">
        <RightSidebar />
      </div>
    </div>
  );
};
export default HashtagHomePageComponent;
