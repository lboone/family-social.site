"use client";

import useGetUser from "@/hooks/useGetUser";
import { API_URL_USER } from "@/server";
import { User, UserProfileFormData } from "@/types";
import axios from "axios";
import { useEffect, useState } from "react";
import PageLoader from "../Form/PageLoader";
import LeftSidebar from "../Home/LeftSidebar";
import SidebarMobile from "../Home/SidebarMobile";
import { handleAuthRequest } from "../utils/apiRequests";
import ProfileBottom from "./ProfileBottom";
import ProfileHeader from "./ProfileHeader";

interface ProfileProps {
  id: string;
}
const Profile = ({ id }: ProfileProps) => {
  const { user } = useGetUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<User>();

  const isOwnProfile = user?._id === id;
  const [formData] = useState<UserProfileFormData>({
    data: {
      data: {
        user: undefined,
      },
    },
  });

  useEffect(() => {
    const getUserProfile = async () => {
      const getUserRequest = async (): Promise<UserProfileFormData> => {
        return await axios.get(`${API_URL_USER}/profile/${id}`, {
          withCredentials: true,
        });
      };

      const result = await handleAuthRequest(
        formData,
        getUserRequest,
        setIsLoading
      );
      if (result) {
        setUserProfile(result.data.data.user);
      }
    };
    getUserProfile();
  }, [id, formData, setUserProfile, setIsLoading]);

  if (isLoading || !userProfile) {
    return <PageLoader />;
  }

  return (
    <div className="flex">
      <div className="hidden md:block border-r-2 h-screen fixed w-[20%]">
        <LeftSidebar />
      </div>
      <div className="flex-1 md:ml-[20%] overflow-y-auto">
        <SidebarMobile />
        <div className="w-[90%] sm:w-[80%] mx-auto">
          <ProfileHeader
            isOwnProfile={isOwnProfile}
            userProfile={userProfile}
          />
          <ProfileBottom
            userProfile={userProfile}
            isOwnProfile={isOwnProfile}
          />
        </div>
      </div>
    </div>
  );
};
export default Profile;
