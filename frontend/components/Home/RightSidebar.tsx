"use client";

import useGetUser from "@/hooks/useGetUser";
import { API_URL_USER } from "@/server";
import { SuggestedUsersFormData, User } from "@/types";
import axios from "axios";
import { useEffect, useState } from "react";
import PageLoader from "../Form/PageLoader";
import { handleAuthRequest } from "../utils/apiRequests";
import SuggestedUsersList from "./SuggestedUsersList";
import UserProfileCard from "./UserProfileCard";

const RightSidebar = () => {
  const { user } = useGetUser();

  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData] = useState<SuggestedUsersFormData>({
    data: {
      data: {
        users: [],
      },
    },
  });

  useEffect(() => {
    const getSuggestedUsers = async () => {
      const getSuggestedUserRequest =
        async (): Promise<SuggestedUsersFormData> => {
          return await axios.get(`${API_URL_USER}/suggested-users`, {
            withCredentials: true,
          });
        };
      const result = await handleAuthRequest(
        formData,
        getSuggestedUserRequest,
        setIsLoading
      );
      if (result) {
        setSuggestedUsers(result.data.data.users);
      }
    };
    getSuggestedUsers();
  }, [setIsLoading, formData]);
  if (isLoading) {
    return <PageLoader />;
  }
  return (
    <div className="sticky top-8 flex flex-col gap-2 h-fit">
      <UserProfileCard
        user={user!}
        avatarClassName="h-12 w-12"
        avatarImageClassName="h-12 w-12"
      />
      <SuggestedUsersList suggestedUsers={suggestedUsers} />
    </div>
  );
};
export default RightSidebar;
