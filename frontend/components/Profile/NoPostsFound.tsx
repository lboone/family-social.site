import Image from "next/image";
interface NoPostsFoundProps {
  postType?:
    | "posts"
    | "saved"
    | "liked"
    | "following"
    | "followersUsers"
    | "followingUsers";
  isOwnProfile?: boolean;
}
const NoPostsFound = ({ postType, isOwnProfile }: NoPostsFoundProps) => {
  let titleMessage;
  let descriptionMessage;
  let directionMessage;

  switch (postType) {
    case "posts":
      titleMessage = "No Posts Yet";
      descriptionMessage = `Posts ${
        isOwnProfile ? "you create" : "they create"
      } will appear here.`;
      directionMessage = `${
        isOwnProfile
          ? "Start your first post now"
          : "Looks like they haven't created any posts yet"
      }`;
      break;
    case "saved":
      titleMessage = "No Saved Posts Yet";
      descriptionMessage = "Posts you save will appear here.";
      directionMessage = "Save your first post now!";
      break;
    case "liked":
      titleMessage = "No Liked Posts Yet";
      descriptionMessage = "Posts you like will appear here.";
      directionMessage = "Like your first post now!";
      break;
    case "following":
      titleMessage = "No Following Posts Yet";
      descriptionMessage = "Posts from people you follow will appear here.";
      directionMessage = "Follow someone to see their posts!";
      break;
    case "followingUsers":
      titleMessage = "You are not following anyone yet";
      descriptionMessage = "Users who you are following will appear here.";
      directionMessage = "Start following users to see them listed here!";
      break;
    case "followersUsers":
      titleMessage = "You have no followers yet";
      descriptionMessage = "Users who follow you will appear here.";
      directionMessage =
        "Make sure you have a profile image and good bio to let people know who you are!";
      break;
    default:
      titleMessage = "No Posts Yet";
      descriptionMessage = "Posts you create will appear here.";
      directionMessage = "Start your first post now!";
  }
  return (
    <div className="flex flex-col items-center justify-center h-[400px] text-center">
      <Image
        src="/images/no-posts-yet.png"
        alt="No Posts Yet"
        width={200}
        height={200}
        className="w-48 h-48 object-cover mb-4 opacity-50"
        priority
      />
      <h2 className="text-xl font-semibold text-gray-600 mb-2">
        {titleMessage}
      </h2>
      <p className="text-gray-500 mb-4">{descriptionMessage}</p>
      <p className="text-sm text-gray-400">{directionMessage}</p>
    </div>
  );
};
export default NoPostsFound;
