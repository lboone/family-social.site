"use client";
import useGetUser from "@/hooks/useGetUser";
import LogoutButton from "../Auth/LogoutButton";
import Feed from "./Feed";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import SidebarMobile from "./SidebarMobile";
const Home = () => {
  const { isAuthorized } = useGetUser();

  return (
    <>
      {isAuthorized ? (
        <div className="flex">
          <div className="hidden md:block border-r-2 h-screen fixed w-[20%]">
            <LeftSidebar />
          </div>
          <div className="flex-1 md:ml-[20%] overflow-y-auto">
            <SidebarMobile />
            <Feed />
          </div>
          <div className="w-[30%] pt-8 px-6 lg:block hidden">
            <RightSidebar />
          </div>
        </div>
      ) : (
        <h1 className="text-3xl font-bold text-center mt-10">
          Welcome to Family Social
          <LogoutButton variant="outline" size="sm"></LogoutButton>
        </h1>
      )}
    </>
  );
};
export default Home;
