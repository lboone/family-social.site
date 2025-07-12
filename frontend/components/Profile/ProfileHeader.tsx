"use client";
import { User } from "@/types";
import Link from "next/link";
import UserAvatar from "../Home/UserAvatar";
import { Button } from "../ui/button";

interface ProfileHeaderProps {
  isOwnProfile: boolean;
  isFollowing: boolean;
  userProfile: User;
}
const ProfileHeader = ({
  isOwnProfile,
  isFollowing,
  userProfile,
}: ProfileHeaderProps) => {
  const accountActivity = [
    {
      label: "Posts",
      count: userProfile?.posts.length || 0,
    },
    {
      label: "Followers",
      count: userProfile?.followers.length || 0,
    },
    {
      label: "Following",
      count: userProfile?.following.length || 0,
    },
  ];

  return (
    <div className="mt-16 flex md:flex-row flex-col md:items-center pb-16 border-b-2 md:space-x-20">
      <UserAvatar
        user={userProfile!}
        avatarClassName="w-[10rem] h-[10rem] mb-8 md:mb-0"
        avatarImageClassName="w-[10rem] h-[10rem]"
        avatarFallbackClassName="text-xl"
      />
      <div>
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold">{userProfile?.username}</h1>
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
            <Button variant={isFollowing ? "destructive" : "primary"}>
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-8 mt-6 mb-6">
          {accountActivity.map((activity) => (
            <ActivityInfo
              key={activity.label}
              count={activity.count}
              label={activity.label}
            />
          ))}
        </div>
        <p className="w-[80%] font-md">
          {userProfile?.bio
            ? userProfile.bio
            : isOwnProfile
            ? "Tell us something about yourself."
            : "This user hasn't added a bio yet."}
        </p>
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
