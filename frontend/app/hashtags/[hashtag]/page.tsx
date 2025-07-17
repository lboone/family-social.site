import Hashtag from "@/components/Home/Hashtag";
import AuthenticatedProvider from "@/HOC/AuthenticatedProvider";

const HashtagPage = () => {
  return (
    <AuthenticatedProvider>
      <Hashtag />
    </AuthenticatedProvider>
  );
};
export default HashtagPage;
