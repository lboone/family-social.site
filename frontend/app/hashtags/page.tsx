import HashtagHomePageComponent from "@/components/Home/HashtagHomePageComponent";
import AuthenticatedProvider from "@/HOC/AuthenticatedProvider";

const HashtagHomePage = () => {
  return (
    <AuthenticatedProvider>
      <HashtagHomePageComponent />
    </AuthenticatedProvider>
  );
};
export default HashtagHomePage;
