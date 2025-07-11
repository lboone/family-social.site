import Home from "@/components/Home/Home";
import NeedsVerificationProvider from "@/HOC/NeedsVerificationProvider";

const HomePage = () => {
  return (
    <NeedsVerificationProvider>
      <Home />
    </NeedsVerificationProvider>
  );
};
export default HomePage;
