"use client";

import useGetUser from "@/hooks/useGetUser";
import { API_URL_USER } from "@/server";
import { SuggestedUsersFormData, User } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageLoader from "../Form/PageLoader";
import { handleAuthRequest } from "../utils/apiRequests";
import SuggestedUsersList from "./SuggestedUsersList";
import UserProfileCard from "./UserProfileCard";

const RightSidebar = () => {
  const { user } = useGetUser();

  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
    <div className="flex flex-col gap-2">
      <UserProfileCard user={user!} />
      <SuggestedUsersList suggestedUsers={suggestedUsers} />
    </div>
  );
};
export default RightSidebar;
