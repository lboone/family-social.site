"use client";
import useGetUser from "@/hooks/useGetUser";
import { useLogout } from "@/utils/auth";
import {
  HeartIcon,
  HomeIcon,
  LogOutIcon,
  MessageCircleIcon,
  SearchIcon,
  SquarePlusIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const LeftSidebar = () => {
  const { user } = useGetUser();
  const router = useRouter();
  const logout = useLogout();

  const handleSidebar = (label: string) => {
    if (label === "Home") {
      router.push("/");
    }
    if (label === "Profile") {
      router.push(`/profile/${user?._id}`);
    }
    if (label === "Logout") {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    await logout({
      redirectTo: "/auth/login",
      showToast: true,
    });
  };

  const SidebarLinks = [
    {
      icon: <HomeIcon />,
      label: "Home",
    },
    {
      icon: <SearchIcon />,
      label: "Search",
    },
    {
      icon: <MessageCircleIcon />,
      label: "Messages",
    },
    {
      icon: <HeartIcon />,
      label: "Notifications",
    },
    {
      icon: <SquarePlusIcon />,
      label: "Create",
    },
    {
      icon: (
        <Avatar className="w-9 h-9">
          <AvatarImage
            src={user?.profilePicture}
            alt={user?.username}
            className="w-full h-full"
          />
          <AvatarFallback>
            {user?.username
              ? user?.username?.charAt(0).toUpperCase() +
                user?.username?.charAt(1).toUpperCase()
              : "UN"}
          </AvatarFallback>
        </Avatar>
      ),
      label: "Profile",
    },
    {
      icon: <LogOutIcon />,
      label: "Logout",
    },
  ];
  return (
    <div className="h-full">
      <div className="lg:p-6 p-3 cursor-pointer">
        <div
          onClick={() => router.push("/")}
          className="flex justify-center border-t-1 border-b-1 border-sky-600/50 "
        >
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={150}
            height={50}
            className="my-2"
          />
        </div>
        <div className="mt-6">
          {SidebarLinks.map((link, index) => {
            return (
              <div
                key={index}
                className="flex items-center mb-2 rounded-lg p-3 cursor-pointer group transition-all duration-200 hover:bg-gray-100 space-x-2"
                onClick={() => handleSidebar(link.label)}
              >
                <div className="group-hover:scale-110 transition-all duration-200">
                  {link.icon}
                </div>
                <p className="lg:text-lg text-base">{link.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default LeftSidebar;
