"use client";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { BookmarkIcon, GridIcon, HeartIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import Following from "./Following";
import Liked from "./Liked";
import Posts from "./Posts";
import Saved from "./Saved";

interface ProfileBottomProps {
  userProfile: User;
  isOwnProfile: boolean;
}
const ProfileBottom = ({ userProfile, isOwnProfile }: ProfileBottomProps) => {
  const [activeTab, setActiveTab] = useState<string>("POST");
  return (
    <div className="mt-10">
      <div className="flex items-center justify-center space-x-8 border-b border-gray-200 pb-2">
        <div
          className={cn(
            "flex items-center space-x-2 cursor-pointer transition-all duration-200 px-4 py-2 rounded-lg hover:bg-gray-50",
            activeTab === "POST"
              ? "text-sky-600 bg-sky-50"
              : "text-gray-600 hover:text-gray-800"
          )}
          onClick={() => setActiveTab("POST")}
        >
          <GridIcon size={20} />
          <span className="font-semibold">Posts</span>
        </div>
        {isOwnProfile && (
          <>
            <div
              className={cn(
                "flex items-center space-x-2 cursor-pointer transition-all duration-200 px-4 py-2 rounded-lg hover:bg-gray-50",
                activeTab === "SAVE"
                  ? "text-sky-600 bg-sky-50"
                  : "text-gray-600 hover:text-gray-800"
              )}
              onClick={() => setActiveTab("SAVE")}
            >
              <BookmarkIcon size={20} />
              <span className="font-semibold">Saved</span>
            </div>
            <div
              className={cn(
                "flex items-center space-x-2 cursor-pointer transition-all duration-200 px-4 py-2 rounded-lg hover:bg-gray-50",
                activeTab === "LIKED"
                  ? "text-sky-600 bg-sky-50"
                  : "text-gray-600 hover:text-gray-800"
              )}
              onClick={() => setActiveTab("LIKED")}
            >
              <HeartIcon size={20} />
              <span className="font-semibold">Liked</span>
            </div>
            <div
              className={cn(
                "flex items-center space-x-2 cursor-pointer transition-all duration-200 px-4 py-2 rounded-lg hover:bg-gray-50",
                activeTab === "FOLLOWING"
                  ? "text-sky-600 bg-sky-50"
                  : "text-gray-600 hover:text-gray-800"
              )}
              onClick={() => setActiveTab("FOLLOWING")}
            >
              <UsersIcon size={20} />
              <span className="font-semibold">Following</span>
            </div>
          </>
        )}
      </div>
      {activeTab === "POST" && (
        <Posts userProfile={userProfile} isOwnProfile={isOwnProfile} />
      )}
      {activeTab === "SAVE" && <Saved userProfile={userProfile} />}
      {activeTab === "LIKED" && <Liked userProfile={userProfile} />}
      {activeTab === "FOLLOWING" && (
        <Following userProfile={userProfile} isOwnProfile={isOwnProfile} />
      )}
    </div>
  );
};
export default ProfileBottom;
