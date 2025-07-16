"use client";
import useGetUser from "@/hooks/useGetUser";
import { useLogout } from "@/utils/auth";
import { HomeIcon, LogOutIcon, SearchIcon, SquarePlusIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CreatePostModal from "../Post/CreatePostModal";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import AdminIcon from "./AdminIcon";

const LeftSidebar = () => {
  const { user, isAdmin } = useGetUser();
  const router = useRouter();
  const logout = useLogout();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    if (label === "Create") {
      setIsDialogOpen(true);
    }
    if (label === "Admin") {
      router.push("/admin");
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
      icon: <SquarePlusIcon />,
      label: "Create",
    },
    {
      icon: <AdminIcon />,
      label: "Admin",
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
      <CreatePostModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
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
            priority
          />
        </div>
        <div className="mt-6">
          {SidebarLinks.map((link, index) => {
            if (link.label === "Admin" && !isAdmin) {
              return null; // Skip rendering Admin link if user is not an admin
            }
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
