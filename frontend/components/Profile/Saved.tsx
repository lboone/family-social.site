import { User } from "@/types";
import Image from "next/image";
import PostItemShort from "../Form/PostItemShort";

interface SavedProps {
  userProfile: User;
  isOwnProfile: boolean;
}

const Saved = ({ userProfile, isOwnProfile }: SavedProps) => {
  if (userProfile?.savedPosts?.length < 1) {
    return (
      <div className="flex flex-col w-full h-screen items-center ">
        <div className="flex flex-col gap-10 mt-20">
          <h1 className="text-3xl font-bold text-center">No Posts Yet</h1>
          <p className="text-lg text-gray-600 text-center mb-10">
            {isOwnProfile
              ? "You haven't saved any posts yet."
              : "This user hasn't saved any posts yet."}
          </p>
          <Image
            src="/images/no-posts-yet.png"
            alt="No Posts Yet"
            width={500}
            height={500}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-col-2 lg:grid-cols-3 gap-4">
      {userProfile?.savedPosts?.map((post) => {
        if (typeof post === "string") return null;
        console.log(post);
        return (
          <div key={post._id}>
            <PostItemShort post={post} user={userProfile} />
          </div>
        );
      })}
    </div>
  );
};
export default Saved;
