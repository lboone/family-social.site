import { User } from "@/types";
import UserAvatar from "./UserAvatar";

interface SuggestedUsersListProps {
  suggestedUsers: User[];
}
const SuggestedUsersList = ({ suggestedUsers }: SuggestedUsersListProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mt-8">
        <h1 className="font-semibold text-gray-700">Suggested Users</h1>
        <h1 className="font-medium cursor-pointer">See all</h1>
      </div>
      {suggestedUsers.slice(0, 5).map((user) => (
        <SuggestedUser key={user._id} user={user} />
      ))}
    </div>
  );
};
export default SuggestedUsersList;

const SuggestedUser = ({ user }: { user: User }) => {
  return (
    <div className="mt-6 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 cursor-pointer">
          <UserAvatar user={user} />
          <div>
            <h1 className="font-bold">{user.username}</h1>
            <p className="text-gray-700">
              {user.bio || "User Profile Bio Here"}
            </p>
          </div>
        </div>
        <h1 className="font-medium text-sky-600 cursor-pointer">Details</h1>
      </div>
    </div>
  );
};
