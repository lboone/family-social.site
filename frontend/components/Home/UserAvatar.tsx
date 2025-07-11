import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User } from "@/types";

interface UserAvatarProps {
  user: User;
  avatarClassName?: string;
  avatarImageClassName?: string;
  avatarFallbackClassName?: string;
}
const UserAvatar = ({
  user,
  avatarClassName,
  avatarImageClassName,
  avatarFallbackClassName,
}: UserAvatarProps) => {
  return (
    <Avatar className={cn("w-9 h-9", avatarClassName)}>
      <AvatarImage
        src={user?.profilePicture}
        alt={user?.username}
        className={cn(
          "w-8 h-8 rounded-full object-cover",
          avatarImageClassName
        )}
      />
      <AvatarFallback className={cn("text-xs", avatarFallbackClassName)}>
        {user?.username
          ? user?.username?.charAt(0).toUpperCase() +
            user?.username?.charAt(1).toUpperCase()
          : "UN"}
      </AvatarFallback>
    </Avatar>
  );
};
export default UserAvatar;
