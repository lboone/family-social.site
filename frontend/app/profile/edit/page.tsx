import EditProfile from "@/components/Profile/EditProfile/EditProfile";
import AuthenticatedProvider from "@/HOC/AuthenticatedProvider";

const EditProfilePage = () => {
  return (
    <AuthenticatedProvider>
      <EditProfile />
    </AuthenticatedProvider>
  );
};
export default EditProfilePage;
