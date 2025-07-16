"use client";
import useGetUser from "@/hooks/useGetUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FeedUnauthorizedUsers from "./FeedUnauthorizedUsers";
import LeftSidebar from "./LeftSidebar";
import SidebarMobile from "./SidebarMobile";

const Admin = () => {
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
        <FeedUnauthorizedUsers />
      </div>
    </div>
  );
};
export default Admin;
