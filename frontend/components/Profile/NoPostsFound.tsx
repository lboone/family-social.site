import Image from "next/image";
interface NoPostsFoundProps {
  postType?: "posts" | "saved" | "liked" | "following" | "followers";
}
const NoPostsFound = ({ postType }: NoPostsFoundProps) => {
  let titleMessage = "No Posts Yet";
  let descriptionMessage = "Posts you create will appear here.";
  let directionMessage = "Start your first post now!";

  switch (postType) {
    case "posts":
      titleMessage = "No Posts Yet";
      descriptionMessage = "Posts you create will appear here.";
      directionMessage = "Start your first post now!";
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
    case "followers":
      titleMessage = "No Followers Yet";
      descriptionMessage = "People who follow you will appear here.";
      directionMessage = "Start following people to see their posts!";
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
