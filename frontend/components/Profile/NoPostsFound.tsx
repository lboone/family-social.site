import { BookmarkIcon, GridIcon, HeartIcon } from "lucide-react";
import Image from "next/image";
interface NoPostsFoundProps {
  isOwnProfile: boolean;
  postType?: "posts" | "saved" | "liked";
}
const NoPostsFound = ({ isOwnProfile, postType }: NoPostsFoundProps) => {
  return (
    <div className="flex flex-col w-full h-screen items-center ">
      <div className="flex flex-col gap-10 mt-20">
        <div className="flex items-center justify-center mb-4">
          <div
            className={`p-4 rounded-full ${
              postType === "posts"
                ? "bg-sky-50"
                : postType === "saved"
                ? "bg-emerald-50"
                : "bg-red-50"
            }`}
          >
            {postType === "posts" && (
              <GridIcon size={48} className="text-sky-400" />
            )}

            {postType === "saved" && (
              <BookmarkIcon size={48} className="text-emerald-600" />
            )}
            {postType === "liked" && (
              <HeartIcon size={48} className="text-red-400" />
            )}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center">{`No ${
          postType === "posts"
            ? "Posts"
            : postType === "saved"
            ? "Saved Posts"
            : "Liked Posts"
        } Yet`}</h1>
        <p className="text-lg text-gray-600 text-center mb-10">
          {isOwnProfile
            ? `You haven't ${
                postType === "posts" ? "posted" : postType
              } any posts yet. Start exploring and like posts you enjoy!`
            : `This user hasn't ${
                postType === "posts" ? "posted" : postType
              } any posts yet.`}
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
};
export default NoPostsFound;
