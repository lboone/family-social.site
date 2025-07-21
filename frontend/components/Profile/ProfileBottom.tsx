"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useGetUser from "@/hooks/useGetUser";

import { cn } from "@/lib/utils";
import { User } from "@/types";
import {
  BookmarkIcon,
  GridIcon,
  HeartIcon,
  Users2Icon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import FollowersFollowingUsers from "./FollowersFollowingUsers";
import Following from "./Following";
import Liked from "./Liked";
import Posts from "./Posts";
import Saved from "./Saved";

interface ProfileBottomProps {
  userProfile: User;
  isOwnProfile: boolean;
}
const ProfileBottom2 = ({ userProfile, isOwnProfile }: ProfileBottomProps) => {
  const { user } = useGetUser();
  const [isMobile, setIsMobile] = useState(false);

  const isFollowing =
    user?.following?.some(
      (followId) => String(followId) === String(userProfile?._id)
    ) || false;

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 576);
    };

    // Check on mount
    checkIsMobile();

    // Add resize listener
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []); // Empty dependency array - only run on mount/unmount

  const getLabelStyle = () => {
    return isMobile && isOwnProfile ? "hidden" : "";
  };

  return (
    <div className="mt-10">
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 lg:gap-8 border-gray-200 pb-2">
        <Tabs defaultValue="POST" className="w-full">
          <TabsList className="flex items-center justify-between w-full! bg-white">
            <TabsTrigger value="POST">
              <GridIcon size={20} />
              <span className={cn("font-semibold", getLabelStyle())}>
                Posts
              </span>
            </TabsTrigger>
            {(isOwnProfile || isFollowing) && (
              <>
                <TabsTrigger value="SAVE">
                  <BookmarkIcon size={20} />
                  <span className={cn("font-semibold", getLabelStyle())}>
                    Saved
                  </span>
                </TabsTrigger>
                <TabsTrigger value="LIKED">
                  <HeartIcon size={20} />
                  <span className={cn("font-semibold", getLabelStyle())}>
                    Liked
                  </span>
                </TabsTrigger>
              </>
            )}
            {isOwnProfile && (
              <>
                <TabsTrigger value="FOLLOWING">
                  <UsersIcon size={20} />
                  <span className={cn("font-semibold", getLabelStyle())}>
                    Following
                  </span>
                </TabsTrigger>
                <TabsTrigger value="FOLLOWERS">
                  <Users2Icon size={20} />
                  <span className={cn("font-semibold", getLabelStyle())}>
                    Followers
                  </span>
                </TabsTrigger>
              </>
            )}
          </TabsList>
          <TabsContent value="POST" className="border-y mt-2 py-2">
            <Posts userProfile={userProfile} isOwnProfile={isOwnProfile} />
          </TabsContent>
          {(isOwnProfile || isFollowing) && (
            <>
              <TabsContent value="SAVE" className="border-y mt-2 py-2">
                <Saved userProfile={userProfile} />
              </TabsContent>
              <TabsContent value="LIKED" className="border-y mt-2 py-2">
                <Liked userProfile={userProfile} />
              </TabsContent>
            </>
          )}
          {isOwnProfile && (
            <>
              <TabsContent value="FOLLOWING" className="border-y mt-2 py-2">
                <Tabs defaultValue="FOLLOWINGPOSTS">
                  <TabsList className="flex items-center justify-between w-full! md:w-1/2! bg-white">
                    <TabsTrigger value="FOLLOWINGPOSTS">
                      <GridIcon size={20} />
                      <span
                        className={cn("font-semibold", {
                          isMobile,
                          hidden: "",
                        })}
                      >
                        Posts
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="FOLLOWINGUSERS">
                      <UsersIcon size={20} />
                      <span
                        className={cn("font-semibold", {
                          isMobile,
                          hidden: "",
                        })}
                      >
                        Users
                      </span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="FOLLOWINGPOSTS" className="mt-2 pt-2">
                    <Following
                      userProfile={userProfile}
                      isOwnProfile={isOwnProfile}
                    />
                  </TabsContent>
                  <TabsContent value="FOLLOWINGUSERS" className="mt-2 pt-2">
                    <FollowersFollowingUsers
                      users={userProfile.following as User[]}
                      postType="followingUsers"
                      isOwnProfile={isOwnProfile}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>
              <TabsContent value="FOLLOWERS" className="border-y mt-2 py-2">
                <FollowersFollowingUsers
                  users={userProfile.followers as User[]}
                  postType="followersUsers"
                  isOwnProfile={isOwnProfile}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};
export default ProfileBottom2;
