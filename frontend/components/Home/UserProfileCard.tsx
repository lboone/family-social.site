import { cn } from "@/lib/utils";
import { User } from "@/types";
import FormattedBio from "../Form/FormattedBio";
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
  // Create styles for background and text color
  const cardStyle = {
    backgroundImage: user.profileBackground
      ? `url(${user.profileBackground})`
      : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    borderRadius: user.profileBackground ? "1rem" : "0",
  };

  const textStyle = {
    color: user.usernameColor || undefined,
  };

  return (
    <div
      className="flex items-center justify-between border-t-1 border-b-1 border-sky-600/50 py-5 px-2 relative"
      style={cardStyle}
    >
      {/* Add overlay for better text readability when background image is present */}
      {user.profileBackground && (
        <div className="absolute inset-0 bg-black/20 rounded-[1rem]"></div>
      )}

      <div className="flex items-center space-x-4 relative z-10">
        <UserAvatar
          user={user}
          avatarClassName={cn(
            "border-4 border-white shadow-lg",
            avatarClassName
          )}
          avatarImageClassName={avatarImageClassName}
          avatarFallbackClassName={avatarFallbackClassName}
        />
        <div>
          <h1 className="font-bold" style={textStyle}>
            @{user.username.toLowerCase()}
          </h1>
          {user.bio ? (
            <FormattedBio
              bio={user.bio}
              className={cn(
                "text-gray-500",
                user.profileBackground && "text-white/90"
              )}
            />
          ) : (
            <p
              className={cn(
                "text-gray-500",
                user.profileBackground && "text-white/90"
              )}
              style={user.usernameColor ? textStyle : undefined}
            >
              My Profile Bio Here
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
export default UserProfileCard;
