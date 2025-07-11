import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface UserAvatarProps {
  user: User;
}
const UserAvatar = ({ user }: UserAvatarProps) => {
  return (
    <Avatar className="w-9 h-9">
      <AvatarImage
        src={user?.profilePicture}
        alt={user?.username}
        className="w-8 h-8 rounded-full object-cover"
      />
      <AvatarFallback className="text-xs">
        {user?.username
          ? user?.username?.charAt(0).toUpperCase() +
            user?.username?.charAt(1).toUpperCase()
          : "UN"}
      </AvatarFallback>
    </Avatar>
  );
};
export default UserAvatar;
