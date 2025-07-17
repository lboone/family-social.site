import { User } from "@/types";
import Image from "next/image";
import Link from "next/link";
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
    <Link href={`/profile/${user._id}`}>
      <div className="flex items-center space-x-4 p-4 bg-sky-50 rounded-full">
        <Image
          src={user.profilePicture || "/images/default-profile.png"}
          alt={user.username}
          className="w-12 h-12 rounded-full"
          width={48}
          height={48}
          priority
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            @{user.username}
          </h3>
          <p className="text-sm text-gray-500">{user.bio || "No bio"}</p>
        </div>
      </div>
    </Link>
  );
};
