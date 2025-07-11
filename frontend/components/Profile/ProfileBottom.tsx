"use client";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { BookmarkIcon, GridIcon } from "lucide-react";
import { useState } from "react";
import Posts from "./Posts";
import Saved from "./Saved";

interface ProfileBottomProps {
  userProfile: User;
}
const ProfileBottom = ({ userProfile }: ProfileBottomProps) => {
  const [postOrSave, setPostOrSave] = useState<string>("POST");
  return (
    <div className="mt-10">
      <div className="flex items-center justify-center space-x-14">
        <div
          className={cn(
            "flex items-center space-x-2 cursor-pointer",
            postOrSave === "POST" && "text-sky-600"
          )}
          onClick={() => setPostOrSave("POST")}
        >
          <GridIcon />
          <span className="font-semibold">Post</span>
        </div>
        <div
          className={cn(
            "flex items-center space-x-2 cursor-pointer",
            postOrSave === "SAVE" && "text-sky-500"
          )}
          onClick={() => setPostOrSave("SAVE")}
        >
          <BookmarkIcon />
          <span className="font-semibold">Saved</span>
        </div>
      </div>
      {postOrSave === "POST" && <Posts userProfile={userProfile} />}
      {postOrSave === "SAVE" && <Saved userProfile={userProfile} />}
    </div>
  );
};
export default ProfileBottom;
