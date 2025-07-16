import Profile from "@/components/Profile/Profile";
import AuthenticatedProvider from "@/HOC/AuthenticatedProvider";

const ProfilePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <AuthenticatedProvider>
      <Profile id={id} />
    </AuthenticatedProvider>
  );
};
export default ProfilePage;
