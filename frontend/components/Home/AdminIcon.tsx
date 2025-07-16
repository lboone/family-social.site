"use client";

import { API_URL_USER } from "@/server";
import axios from "axios";
import { CogIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Badge } from "../ui/badge";
import { handleAuthRequest } from "../utils/apiRequests";

const AdminIcon = () => {
  const dispatch = useDispatch();

  const [unauthorizedUsers, setUnauthorizedUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getAllPost = async () => {
      const getAllPostReq = async () =>
        await axios.get(`${API_URL_USER}/unauthorized-users`, {
          withCredentials: true,
        });
      const result = await handleAuthRequest(null, getAllPostReq, setIsLoading);
      if (result) {
        console.log({ result });
        setUnauthorizedUsers(result.data.results);
      }
    };
    getAllPost();
  }, [dispatch]);
  if (isLoading) {
    return <CogIcon className="animate-spin" />;
  }
  return (
    <div className="relative inline-block">
      <CogIcon className="w-6 h-6" />
      {unauthorizedUsers > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 min-w-[20px] h-5 text-xs flex items-center justify-center px-0.5 py-0"
        >
          {unauthorizedUsers}
        </Badge>
      )}
    </div>
  );
};
export default AdminIcon;
