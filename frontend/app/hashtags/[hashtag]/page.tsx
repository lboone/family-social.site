import Hashtag from "@/components/Home/Hashtag";
import NeedsVerificationProvider from "@/HOC/NeedsVerificationProvider";

const HashtagPage = () => {
  return (
    <NeedsVerificationProvider>
      <Hashtag />
    </NeedsVerificationProvider>
  );
};
export default HashtagPage;
