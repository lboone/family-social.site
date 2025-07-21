import { User } from "@/types";
import Link from "next/link";
import FormattedBio from "../Form/FormattedBio";
import UserAvatar from "../Home/UserAvatar";
import NoPostsFound from "./NoPostsFound";

interface FollowersFollowingUsersProps {
  users: User[];
  isOwnProfile?: boolean;
  postType?: "followingUsers" | "followersUsers";
}
const FollowersFollowingUsers = ({
  users,
  isOwnProfile,
  postType,
}: FollowersFollowingUsersProps) => {
  if (users.length < 1) {
    return <NoPostsFound postType={postType} isOwnProfile={isOwnProfile} />;
  }
  const totalPosts = users.length;

  let titleMessage = "";
  let descriptionMessage = "";

  if (postType === "followersUsers") {
    titleMessage = `Users following you (${totalPosts})`;
    descriptionMessage = "Users who follow you will appear here.";
  } else {
    titleMessage = `Users you are following (${totalPosts})`;
    descriptionMessage = "Users you are following will appear here.";
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700">{titleMessage}</h2>
        <p className="text-sm text-gray-500">{descriptionMessage}</p>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {users.map((user: User) => {
          return <UserItem key={user._id} user={user} />;
          // Attach ref to the last post for infinite scrolling
        })}
      </div>
    </div>
  );
};
export default FollowersFollowingUsers;

const UserItem = ({ user }: { user: User }) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-sky-50 rounded-full">
      <Link href={`/profile/${user._id}`}>
        <UserAvatar
          user={user}
          avatarClassName="h-14 w-14 cursor-pointer"
          avatarImageClassName="h-14 w-14"
        />
      </Link>
      <div className="flex-1">
        <Link href={`/profile/${user._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600">
            @{user.username}
          </h3>
        </Link>
        {user.bio ? (
          <FormattedBio bio={user.bio} className="text-sm text-gray-500" />
        ) : (
          <p className="text-sm text-gray-500">No bio</p>
        )}
      </div>
    </div>
  );
};
