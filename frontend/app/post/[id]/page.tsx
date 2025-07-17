import Post from "@/components/Post/Post";
import AuthenticatedProvider from "@/HOC/AuthenticatedProvider";

const PostPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <AuthenticatedProvider>
      <Post id={id} />
    </AuthenticatedProvider>
  );
};
export default PostPage;
