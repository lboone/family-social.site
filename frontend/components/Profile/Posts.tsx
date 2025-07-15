import { User } from "@/types";
import Image from "next/image";
import PostItemShort from "../Form/PostItemShort";

interface PostsProps {
  userProfile: User;
  isOwnProfile: boolean;
}
const Posts = ({ userProfile, isOwnProfile }: PostsProps) => {
  if (userProfile?.posts?.length < 1) {
    return (
      <div className="flex flex-col w-full h-screen items-center ">
        <div className="flex flex-col gap-10 mt-20">
          <h1 className="text-3xl font-bold text-center">No Posts Yet</h1>
          <p className="text-lg text-gray-600 text-center mb-10">
            {isOwnProfile
              ? "You haven't posted any posts yet."
              : "This user hasn't posted any posts yet."}
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
      {userProfile?.posts?.map((post) => {
        return <PostItemShort key={post._id} post={post} user={userProfile} />;
      })}
    </div>
  );
};
export default Posts;
