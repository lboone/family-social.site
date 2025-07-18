import { User } from "@/types";
import UserAvatar from "./UserAvatar";

interface UserProfileCardProps {
  user: User;
  avatarImageClassName?: string;
  avatarClassName?: string;
  avatarFallbackClassName?: string;
}
const UserProfileCard = ({
  user,
  avatarImageClassName,
  avatarClassName,
  avatarFallbackClassName,
}: UserProfileCardProps) => {
  return (
    <div className="flex items-center justify-between border-t-1 border-b-1 border-sky-600/50 py-5 px-2">
      <div className="flex items-center space-x-4">
        <UserAvatar
          user={user}
          avatarClassName={avatarClassName}
          avatarImageClassName={avatarImageClassName}
          avatarFallbackClassName={avatarFallbackClassName}
        />
        <div>
          <h1 className="font-bold">@{user.username.toLowerCase()}</h1>
          <p className="text-gray-500">{user.bio || "My Profile Bio Here"}</p>
        </div>
      </div>
    </div>
  );
};
export default UserProfileCard;
