import Verify from "@/components/Auth/Verify";
import VerifiedProvider from "@/HOC/VerifiedProvider";

const VerifyPage = () => {
  return (
    <VerifiedProvider>
      <Verify />
    </VerifiedProvider>
  );
};
export default VerifyPage;
