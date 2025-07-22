"use client";
import { useFollowUnfollow } from "@/hooks/useAuth";
import useGetUser from "@/hooks/useGetUser";
import { User } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import FormattedBio from "../Form/FormattedBio";
import UserAvatar from "../Home/UserAvatar";
import { Button } from "../ui/button";

interface ProfileHeaderProps {
  isOwnProfile: boolean;
  userProfile: User;
}
const ProfileHeader = ({ isOwnProfile, userProfile }: ProfileHeaderProps) => {
  const { user } = useGetUser();

  // Local state to track follower count
  const [followerCount, setFollowerCount] = useState<number>(
    userProfile?.followers.length || 0
  );

  // Update follower count when userProfile changes
  useEffect(() => {
    setFollowerCount(userProfile?.followers.length || 0);
  }, [userProfile]);

  // Calculate isFollowing from current Redux state
  const isFollowing =
    user?.following?.some(
      (followId) => String(followId) === String(userProfile._id)
    ) || false;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize the follow/unfollow hook first
  const { handleFollowUnfollow } = useFollowUnfollow({
    setLoading: setIsLoading,
  });

  // Custom follow/unfollow handler that updates local state
  const handleFollowUnfollowWithUpdate = async (userId: string) => {
    const wasFollowing = isFollowing;

    // Optimistically update the follower count
    setFollowerCount((prev) => (wasFollowing ? prev - 1 : prev + 1));

    try {
      await handleFollowUnfollow(userId);
      // Force a small delay to ensure Redux state has been updated
      // This helps ensure the isFollowing calculation reflects the new state
    } catch {
      // Revert the optimistic update if the request failed
      setFollowerCount((prev) => (wasFollowing ? prev + 1 : prev - 1));
    }
  };
  const accountActivity = [
    {
      label: "Posts",
      count: userProfile?.posts.length || 0,
    },
    {
      label: "Followers",
      count: followerCount,
    },
    {
      label: "Following",
      count: userProfile?.following.length || 0,
    },
  ];
  return (
    <div className="relative">
      {/* Background Image Section */}
      <div className="relative w-full h-[200px] bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            transform: userProfile?.profileBackgroundPosition
              ? `translate(${userProfile.profileBackgroundPosition.x}px, ${userProfile.profileBackgroundPosition.y}px) scale(${userProfile.profileBackgroundPosition.scale})`
              : "none",
            transformOrigin: "center",
          }}
        >
          <Image
            src={
              userProfile?.profileBackground ||
              "/images/profile-default-background.webp"
            }
            alt="Profile background"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Profile Content - Overlapping the background image */}
      <div className="relative -mt-20 md:-mt-15 lg:-mt-15 xl:-mt-20 px-6 pb-16 border-b-2">
        <div className="flex md:flex-row flex-col md:items-start md:space-x-20">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <UserAvatar
              user={userProfile}
              avatarClassName="w-[10rem] h-[10rem] mb-8 md:mb-0 border-4 border-white shadow-lg"
              avatarImageClassName="w-[10rem] h-[10rem]"
              avatarFallbackClassName="text-xl"
            />
          </div>

          {/* Right side content */}
          <div className="flex-1 md:pb-4">
            {/* Username and Buttons row */}
            <div className="flex md:items-center space-x-20 md:space-x-10 lg:space-x-20  mb-6 mt-4">
              <>
                <h1
                  className="hidden md:block text-2xl font-bold"
                  style={{
                    color: userProfile?.usernameColor || "#000000",
                  }}
                >
                  {userProfile?.username}
                </h1>
                <h1 className="block md:hidden text-2xl font-bold">
                  {userProfile?.username}
                </h1>
              </>

              <div className="flex space-x-4">
                {isOwnProfile && (
                  <Link href="/profile/edit">
                    <Button
                      variant="secondary"
                      className="cursor-pointer hover:bg-gray-300"
                    >
                      Edit Profile
                    </Button>
                  </Link>
                )}
                {!isOwnProfile && (
                  <Button
                    variant={isFollowing ? "destructive" : "primary"}
                    onClick={() =>
                      handleFollowUnfollowWithUpdate(userProfile._id)
                    }
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Updating..."
                      : isFollowing
                      ? "Unfollow"
                      : "Follow"}
                  </Button>
                )}
              </div>
            </div>

            {/* Stats row - positioned to stay below background */}
            <div className="flex items-center space-x-8 mb-6 mt-10 md:mt-12">
              {accountActivity.map((activity) => (
                <ActivityInfo
                  key={activity.label}
                  count={activity.count}
                  label={activity.label}
                />
              ))}
            </div>

            {/* Bio - positioned to stay below background */}
            <div className="w-full md:w-[80%] mt-4">
              {userProfile?.bio ? (
                <FormattedBio bio={userProfile.bio} className="font-md" />
              ) : (
                <p className="font-md text-gray-500">
                  {isOwnProfile
                    ? "Tell us something about yourself."
                    : "This user hasn't added a bio yet."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileHeader;

const ActivityInfo = ({ count, label }: { count: number; label: string }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="font-bold">{count}</span>
      <span>{label}</span>
    </div>
  );
};
