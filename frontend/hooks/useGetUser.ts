import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export const useGetUser = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || "user"; // Default to 'user' if role is undefined
  const isAdmin = user?.role === "admin";
  const isVerified = user?.isVerified || false;
  const isActive = user?.isActive || false;
  const isAuthorized = isVerified && isActive;
  const email = user?.email || "";
  const username = user?.username || "";
  const bio = user?.bio || "";
  const followersCount = user?.followers?.length || 0;
  const followingCount = user?.following?.length || 0;
  const postsCount = user?.posts?.length || 0;
  const savedPostsCount = user?.savedPosts?.length || 0;
  return {
    user,
    role,
    isAdmin,
    isVerified,
    isActive,
    isAuthorized,
    email,
    username,
    bio,
    followersCount,
    followingCount,
    postsCount,
    savedPostsCount,
  };
};

export default useGetUser;
