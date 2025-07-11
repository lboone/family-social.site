import { User } from "@/types";

interface PostsProps {
  userProfile: User;
}
const Posts = ({ userProfile }: PostsProps) => {
  return <div>Posts</div>;
};
export default Posts;
