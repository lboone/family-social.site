"use client";
import useGetUser from "@/hooks/useGetUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Feed from "./Feed";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import SidebarMobile from "./SidebarMobile";

const Home = () => {
  const { user, isActive, isVerified } = useGetUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/signup");
    } else if (!isVerified) {
      router.push("/auth/verify");
    } else if (!isActive) {
      router.push("/auth/not-active");
    }
  }, [user, isActive, isVerified, router]);

  if (!user || !isVerified || !isActive) {
    return null; // or return a loading spinner
  }

  return (
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
  );
};
export default Home;
