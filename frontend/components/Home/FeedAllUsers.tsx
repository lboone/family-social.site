"use client";

import { API_URL_USER } from "@/server";
import { User } from "@/types";
import axios from "axios";
import { CircleUserIcon, CogIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import PageLoader from "../Form/PageLoader";
import { Badge } from "../ui/badge";
import { handleAuthRequest } from "../utils/apiRequests";

// Extended user interface for admin view with OTP fields

const FeedAllUsers = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleActivateUser = async (
    email: string,
    isActive: boolean,
    isVerified: boolean
  ) => {
    if (!isVerified) {
      return toast.error("User must be verified before activation.");
    }
    try {
      const activateUserReq = async () =>
        await axios.post(
          `${API_URL_USER}/set-active`,
          { email, isActive },
          {
            withCredentials: true,
          }
        );

      const result = await handleAuthRequest(
        null,
        activateUserReq,
        setIsLoading
      );
      if (result && result.data.status === "success") {
        // Remove the activated user from the list
        toast.success(result.data.message);
        const getAllPost = async () => {
          const getAllPostReq = async () =>
            await axios.get(`${API_URL_USER}/all`, {
              withCredentials: true,
            });
          const result = await handleAuthRequest(
            null,
            getAllPostReq,
            setIsLoading
          );
          if (result && result.data.status === "success") {
            setAllUsers(result.data.data.users);
          }
        };
        getAllPost();
        router.refresh();
        router.push("/admin");
      }
    } catch (error) {
      toast.error("Failed to activate user");
      console.error("Error activating user:", error);
    }
  };

  useEffect(() => {
    const getAllPost = async () => {
      const getAllPostReq = async () =>
        await axios.get(`${API_URL_USER}/all`, {
          withCredentials: true,
        });
      const result = await handleAuthRequest(null, getAllPostReq, setIsLoading);
      if (result && result.data.status === "success") {
        setAllUsers(result.data.data.users);
      }
    };
    getAllPost();
  }, [dispatch]);
  if (isLoading) {
    return <PageLoader />;
  }
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Unauthorized Users</h2>
      {allUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OTP Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OTP Expires
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.profilePicture ? (
                          <Image
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profilePicture!}
                            alt={user.username}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <CircleUserIcon className="h-10 w-10 rounded-full" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={user.isVerified ? "primary" : "destructive"}
                        className="text-xs"
                      >
                        {user.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                      <Badge
                        variant={user.isActive ? "primary" : "destructive"}
                        className="text-xs"
                        onClick={() =>
                          handleActivateUser(
                            user.email,
                            !user.isActive,
                            user.isVerified
                          )
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {!user.isVerified && user.otp ? (
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {user.otp}
                        </code>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {!user.isVerified && user.otpExpires ? (
                        <div className="flex flex-col">
                          <span className="text-xs">
                            {new Date(user.otpExpires).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(user.otpExpires).toLocaleTimeString()}
                          </span>
                          <span
                            className={`text-xs ${
                              new Date(user.otpExpires) < new Date()
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {new Date(user.otpExpires) < new Date()
                              ? "Expired"
                              : "Valid"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No unauthorized users
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            All users are verified and active.
          </p>
        </div>
      )}
    </div>
  );
};
export default FeedAllUsers;
